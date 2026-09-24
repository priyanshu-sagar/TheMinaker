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

  @Column({ type: 'text', enum: UserRole })
  role!: UserRole;

  @Column({ name: 'full_name', type: 'text' })
  fullName!: string;

  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  email?: string;

  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  phone?: string;

  @Column({ name: 'password_hash', type: 'text', nullable: true, select: false })
  passwordHash?: string;

  @Column({ name: 'fcm_token', type: 'text', nullable: true })
  fcmToken?: string;

  @Column({ type: 'text', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
