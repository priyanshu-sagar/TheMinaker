import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('students')
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Column({ name: 'roll_number', type: 'text' })
  rollNumber!: string;

  @Column({ name: 'class_section', type: 'text' })
  classSection!: string;

  /** Optional readable short ID printed on school letter, e.g. DPS-2024-0042 */
  @Index({ unique: true })
  @Column({ name: 'student_uid', type: 'text', nullable: true })
  studentUid?: string;

  @Column({ name: 'parent_user_id', type: 'uuid', nullable: true })
  parentUserId?: string;

  @Column({ name: 'bus_route_id', type: 'uuid', nullable: true })
  busRouteId?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ name: 'gender', type: 'text', nullable: true })
  gender?: string;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl?: string;

  @Column({ type: 'text', default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
