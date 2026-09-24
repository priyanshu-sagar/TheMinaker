import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TenantPlan, TenantStatus } from '@minaker/shared-types';

@Entity('tenants')
export class TenantEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'text', enum: TenantPlan, default: TenantPlan.STARTER })
  plan!: TenantPlan;

  @Column({ type: 'text', enum: TenantStatus, default: TenantStatus.TRIAL })
  status!: TenantStatus;

  @Column({ name: 'dpdp_region', type: 'text', default: 'ap-south-1' })
  dpdpRegion!: string;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl?: string;

  @Column({ name: 'max_students', type: 'integer', default: 500 })
  maxStudents!: number;

  @Column({ name: 'max_buses', type: 'integer', default: 5 })
  maxBuses!: number;

  @Column({ type: 'jsonb', default: {} })
  settings!: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
