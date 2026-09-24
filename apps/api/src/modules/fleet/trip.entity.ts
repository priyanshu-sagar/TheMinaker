import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('trips')
export class TripEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'bus_id', type: 'uuid' })
  busId!: string;

  @Column({ name: 'route_id', type: 'uuid' })
  routeId!: string;

  @Column({ name: 'conductor_id', type: 'uuid' })
  conductorId!: string;

  @Column({ name: 'trip_type', type: 'text' })
  tripType!: 'morning' | 'afternoon' | 'custom';

  @Column({ type: 'text', default: 'pending' })
  status!: 'pending' | 'active' | 'completed' | 'cancelled';

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @Column({ name: 'student_count', type: 'integer', default: 0 })
  studentCount!: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
