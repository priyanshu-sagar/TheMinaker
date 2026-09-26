import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { withTenant } from '../../common/tenant-context';
import { Redis } from 'ioredis';
import * as mqtt from 'mqtt';

export interface LocationPayload {
  conductorId: string;
  tripId?: string;
  lat: number;
  lng: number;
  speedKmh?: number;
  heading?: number;
  accuracyM?: number;
  batteryPct?: number;
  timestamp?: string;
}

@Injectable()
export class TelemetryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelemetryService.name);
  private mqttClient!: mqtt.MqttClient;
  private redisClient!: Redis;

  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  onModuleInit() {
    const mqttUrl = this.config.get<string>('MQTT_URL', 'mqtt://localhost:1883');
    const redisUrl = this.config.get<string>('REDIS_URL', 'redis://localhost:6379');

    this.redisClient = new Redis(redisUrl);

    this.mqttClient = mqtt.connect(mqttUrl);

    this.mqttClient.on('connect', () => {
      this.logger.log('Connected to MQTT broker for telemetry ingestion');
      // Subscribe to wildcard topic for all buses across all tenants
      this.mqttClient.subscribe('minaker/+/bus/+/location', (err) => {
        if (err) this.logger.error('Failed to subscribe to MQTT telemetry', err);
      });
    });

    this.mqttClient.on('message', (topic, message) => {
      this.handleIncomingTelemetry(topic, message.toString()).catch((err) => {
        this.logger.error(`Error processing telemetry for topic ${topic}`, err);
      });
    });
  }

  onModuleDestroy() {
    this.mqttClient?.end();
    this.redisClient?.disconnect();
  }

  private async handleIncomingTelemetry(topic: string, payloadStr: string) {
    // Topic format: minaker/{tenantId}/bus/{busId}/location
    const parts = topic.split('/');
    if (parts.length !== 5) return;
    
    const tenantId = parts[1]!;
    const busId = parts[3]!;
    
    let payload: LocationPayload;
    try {
      payload = JSON.parse(payloadStr);
    } catch {
      return; // Ignore malformed JSON
    }

    if (!payload.lat || !payload.lng || !payload.conductorId) return;

    const time = payload.timestamp ? new Date(payload.timestamp) : new Date();

    // 1. Insert into TimescaleDB via raw SQL for high throughput (avoids TypeORM overhead)
    await withTenant(this.dataSource, tenantId, (manager) =>
      manager.query(
        `INSERT INTO gps_telemetry
          (time, tenant_id, bus_id, conductor_id, trip_id, lat, lng, speed_kmh, heading, accuracy_m, battery_pct)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          time,
          tenantId,
          busId,
          payload.conductorId,
          payload.tripId ?? null,
          payload.lat,
          payload.lng,
          payload.speedKmh ?? null,
          payload.heading ?? null,
          payload.accuracyM ?? null,
          payload.batteryPct ?? null,
        ],
      ),
    );

    // 2. Cache latest position in Redis for instant retrieval by web/mobile apps (TTL 60s)
    const redisPayload = JSON.stringify({ busId, tenantId, ...payload, time });
    await this.redisClient.setex(`bus:pos:${busId}`, 60, redisPayload);

    // 3. Publish to Redis Pub/Sub for the WebSocket Gateway to broadcast to parents
    await this.redisClient.publish(`tenant:${tenantId}:telemetry`, redisPayload);
  }

  /**
   * Fetch the latest known position of a bus from Redis (fast path).
   */
  async getLatestPosition(busId: string): Promise<LocationPayload | null> {
    const data = await this.redisClient.get(`bus:pos:${busId}`);
    return data ? JSON.parse(data) : null;
  }
}
