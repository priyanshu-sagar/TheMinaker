import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AttendanceStatus, AttendanceType } from '@minaker/shared-types';

@Entity('attendance_events')
export class AttendanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @Column({ name: 'marked_by', type: 'uuid' })
  markedBy!: string;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId?: string;

  @Column({ name: 'attendance_type', type: 'text' })
  attendanceType!: AttendanceType;

  @Column({ type: 'text', default: AttendanceStatus.PRESENT })
  status!: AttendanceStatus;

  @CreateDateColumn({ name: 'marked_at', type: 'timestamptz' })
  markedAt!: Date;

  /**
   * Generated always as CAST(marked_at AT TIME ZONE 'UTC' AS DATE).
   * Used by the UNIQUE constraint (student_id, attendance_type, marked_date).
   * Read-only — never set manually.
   */
  @Column({ name: 'marked_date', type: 'date', insert: false, update: false })
  markedDate!: string;

  @Column({ name: 'gate_location', type: 'text', nullable: true })
  gateLocation?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;
}
