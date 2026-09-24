import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('routes')
export class RouteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ type: 'text' })
  name!: string;

  /** Array of stop objects: {name, lat, lng, order, estimatedMinutesFromStart} */
  @Column({ type: 'jsonb', default: [] })
  stops!: Array<{
    name: string;
    lat: number;
    lng: number;
    order: number;
    estimatedMinutesFromStart: number;
  }>;

  /** Encoded polyline string for map display */
  @Column({ type: 'text', nullable: true })
  polyline?: string;

  @Column({ type: 'text', default: 'active' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
