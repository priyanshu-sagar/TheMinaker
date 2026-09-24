import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AttendanceStatus,
  AttendanceType,
  MarkAttendanceBatchRequest,
  MarkAttendanceRequest,
  StudentWithAttendance,
} from '@minaker/shared-types';
import { AttendanceEntity } from './attendance.entity';
import { StudentsService } from '../students/students.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(AttendanceEntity)
    private readonly repo: Repository<AttendanceEntity>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly studentsService: StudentsService,
  ) {}

  /** Fetch student roster with today's attendance pre-loaded (single LEFT JOIN query). */
  async getRoster(
    tenantId: string,
    attendanceType: string,
    date?: string,
    classSection?: string,
  ): Promise<StudentWithAttendance[]> {
    const effectiveDate = date ?? new Date().toISOString().split('T')[0]!;
    return this.studentsService.getRosterWithAttendance(
      tenantId,
      effectiveDate,
      attendanceType,
      classSection,
    );
  }

  /**
   * Mark a single student — upsert on (student_id, attendance_type, marked_date).
   * Safe to call repeatedly as the gatekeeper toggles the status.
   */
  async mark(tenantId: string, dto: MarkAttendanceRequest, markedBy: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO attendance_events
         (tenant_id, student_id, marked_by, attendance_type, status, gate_location, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (student_id, attendance_type, marked_date)
       DO UPDATE SET
         status        = EXCLUDED.status,
         marked_by     = EXCLUDED.marked_by,
         gate_location = EXCLUDED.gate_location,
         notes         = EXCLUDED.notes,
         marked_at     = now()`,
      [
        tenantId,
        dto.studentId,
        markedBy,
        dto.attendanceType,
        dto.status ?? AttendanceStatus.PRESENT,
        dto.gateLocation ?? null,
        dto.notes ?? null,
      ],
    );
  }

  /**
   * Mark a batch of students in a single transaction — max 200 per call.
   * Used by the mobile offline queue sync on reconnect.
   */
  async markBatch(
    tenantId: string,
    dto: MarkAttendanceBatchRequest,
    markedBy: string,
  ): Promise<{ synced: number }> {
    if (dto.marks.length > 200) {
      throw new BadRequestException('Batch size cannot exceed 200 marks');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // SET LOCAL scopes tenant context to this transaction — required for RLS + PgBouncer transaction mode
      await queryRunner.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);

      for (const mark of dto.marks) {
        await queryRunner.query(
          `INSERT INTO attendance_events
             (tenant_id, student_id, marked_by, attendance_type, status, gate_location)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (student_id, attendance_type, marked_date)
           DO UPDATE SET
             status        = EXCLUDED.status,
             marked_by     = EXCLUDED.marked_by,
             gate_location = EXCLUDED.gate_location,
             marked_at     = now()`,
          [
            tenantId,
            mark.studentId,
            markedBy,
            mark.attendanceType ?? dto.attendanceType,
            mark.status ?? AttendanceStatus.PRESENT,
            dto.gateLocation ?? null,
          ],
        );
      }

      await queryRunner.commitTransaction();
      return { synced: dto.marks.length };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /** Daily summary counts for gatekeeper summary tab */
  async getDailySummary(
    tenantId: string,
    date: string,
    attendanceType: AttendanceType,
  ): Promise<{ present: number; absent: number; late: number; unmarked: number; total: number }> {
    const rows = await this.dataSource.query<Array<{ status: string; count: string }>>(
      `SELECT ae.status, COUNT(*) AS count
       FROM attendance_events ae
       WHERE ae.tenant_id = $1
         AND ae.attendance_type = $2
         AND ae.marked_date = $3
       GROUP BY ae.status`,
      [tenantId, attendanceType, date],
    );

    const totalRows = await this.dataSource.query<Array<{ count: string }>>(
      `SELECT COUNT(*) AS count FROM students WHERE tenant_id = $1 AND status = 'active'`,
      [tenantId],
    );

    const byStatus = Object.fromEntries(rows.map((r) => [r.status, parseInt(r.count, 10)]));
    const present = byStatus['present'] ?? 0;
    const absent  = byStatus['absent']  ?? 0;
    const late    = byStatus['late']    ?? 0;
    const total   = parseInt(totalRows[0]?.count ?? '0', 10);

    return { present, absent, late, unmarked: total - present - absent - late, total };
  }
}
