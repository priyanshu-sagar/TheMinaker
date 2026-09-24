import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tenants')
export class SchoolEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'text' })
  slug!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'dpdp_region', type: 'text', default: 'ap-south-1' })
  dpdpRegion!: string;

  @Column({ name: 'max_students', type: 'integer', default: 500 })
  maxStudents!: number;

  @Column({ name: 'max_buses', type: 'integer', default: 5 })
  maxBuses!: number;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;

  @Column({ type: 'text', default: 'trial' })
  status!: string;

  @Column({ type: 'text', default: 'starter' })
  plan!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
