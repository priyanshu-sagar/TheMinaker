import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('gps_telemetry')
export class GpsTelemetryEntity {
  @PrimaryColumn({ type: 'timestamptz' })
  time!: Date;

  @Column({ name: 'tenant_id', type: 'uuid' })
  tenantId!: string;

  @Column({ name: 'bus_id', type: 'uuid' })
  busId!: string;

  @Column({ name: 'conductor_id', type: 'uuid' })
  conductorId!: string;

  @Column({ name: 'trip_id', type: 'uuid', nullable: true })
  tripId?: string;

  @Column({ type: 'float8' })
  lat!: number;

  @Column({ type: 'float8' })
  lng!: number;

  @Column({ name: 'speed_kmh', type: 'numeric', nullable: true })
  speedKmh?: number;

  @Column({ type: 'numeric', nullable: true })
  heading?: number;

  @Column({ name: 'accuracy_m', type: 'numeric', nullable: true })
  accuracyM?: number;

  @Column({ name: 'battery_pct', type: 'smallint', nullable: true })
  batteryPct?: number;
}
