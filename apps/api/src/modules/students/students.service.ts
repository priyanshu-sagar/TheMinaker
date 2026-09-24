import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentWithAttendance } from '@minaker/shared-types';
import { StudentEntity } from './student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly repo: Repository<StudentEntity>,
  ) {}

  async findByTenant(tenantId: string): Promise<StudentEntity[]> {
    return this.repo.find({
      where: { tenantId, status: 'active' },
      order: { classSection: 'ASC', rollNumber: 'ASC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<StudentEntity> {
    const student = await this.repo.findOne({ where: { id, tenantId } });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }

  /**
   * Fetch the full roster with today's attendance pre-loaded.
   * Single query with LEFT JOIN — no N+1 round-trips.
   *
   * @param tenantId   from JWT
   * @param date       YYYY-MM-DD (defaults to today UTC)
   * @param attendanceType filter by mark type (e.g. school_entry)
   * @param classSection   optional class filter (e.g. "10-A")
   */
  async getRosterWithAttendance(
    tenantId: string,
    date: string,
    attendanceType: string,
    classSection?: string,
  ): Promise<StudentWithAttendance[]> {
    const qb = this.repo
      .createQueryBuilder('s')
      .select([
        's.id           AS "id"',
        's.full_name     AS "fullName"',
        's.roll_number   AS "rollNumber"',
        's.class_section AS "classSection"',
        's.student_uid   AS "studentUid"',
        's.photo_url     AS "photoUrl"',
        's.bus_route_id  AS "busRouteId"',
        'ae.status       AS "todayStatus"',
        'ae.marked_at    AS "markedAt"',
        'ae.marked_by    AS "markedBy"',
      ])
      .leftJoin(
        'attendance_events',
        'ae',
        [
          'ae.student_id = s.id',
          'ae.attendance_type = :attendanceType',
          'ae.marked_date = :date',
        ].join(' AND '),
        { attendanceType, date },
      )
      .where('s.tenant_id = :tenantId', { tenantId })
      .andWhere('s.status = :status', { status: 'active' });

    if (classSection) {
      qb.andWhere('s.class_section = :classSection', { classSection });
    }

    qb.orderBy('s.class_section', 'ASC').addOrderBy('s.roll_number', 'ASC');

    const rows = await qb.getRawMany<StudentWithAttendance>();
    return rows;
  }
}
