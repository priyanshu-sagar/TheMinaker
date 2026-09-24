import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole, UserStatus } from '@minaker/shared-types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  tenantId?: string;

  @Column({ type: 'text' })
  role!: UserRole;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  // ─── Contact ─────────────────────────────────────────────────
  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  email?: string;

  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  phone?: string;

  // ─── Auth credentials (role-specific) ────────────────────────
  @Column({ name: 'password_hash', type: 'text', nullable: true, select: false })
  passwordHash?: string;

  /**
   * bcrypt hash of 4–6 digit PIN.
   * Used by conductor and gatekeeper (no OTP needed — PIN works offline).
   */
  @Column({ name: 'pin_hash', type: 'text', nullable: true, select: false })
  pinHash?: string;

  /**
   * Parent's unique ID printed on school letter — e.g. "DPS-P-00123".
   * Used as the login identifier for parents (with phone OTP as credential).
   */
  @Index({ unique: true })
  @Column({ name: 'parent_uid', type: 'text', nullable: true })
  parentUid?: string;

  /**
   * Staff employee ID — for conductor/gatekeeper login.
   * Unique within a tenant (enforced via DB constraint).
   */
  @Column({ name: 'employee_id', type: 'text', nullable: true })
  employeeId?: string;

  // ─── App state ────────────────────────────────────────────────
  @Column({ name: 'fcm_token', type: 'text', nullable: true })
  fcmToken?: string;

  @Column({ type: 'text', default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
