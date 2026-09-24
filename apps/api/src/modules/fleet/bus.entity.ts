import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('buses')
export class BusEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'number_plate', type: 'text' })
  numberPlate!: string;

  @Column({ name: 'route_id', type: 'uuid', nullable: true })
  routeId?: string;

  /** The conductor currently assigned to this bus */
  @Column({ name: 'conductor_id', type: 'uuid', nullable: true })
  conductorId?: string;

  @Column({ name: 'make_model', type: 'text', nullable: true })
  makeModel?: string;

  @Column({ type: 'integer', default: 40 })
  capacity!: number;

  @Column({ type: 'text', default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
