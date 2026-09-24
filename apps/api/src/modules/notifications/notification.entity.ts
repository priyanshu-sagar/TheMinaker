import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Index()
  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId!: string;

  @Column({ type: 'text' })
  type!: 'student_arrived' | 'student_departed' | 'bus_arriving' | 'bus_delayed' | 'attendance_marked' | 'report_ready';

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'jsonb', default: {} })
  data!: Record<string, unknown>;

  @Column({ type: 'text' })
  channel!: 'fcm' | 'sms' | 'in_app';

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt?: Date;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
