import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { HealthModule } from './modules/health/health.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StudentsModule } from './modules/students/students.module';
import { TelemetryModule } from './modules/telemetry/telemetry.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Config — loads .env from apps/api/ regardless of where nest is invoked from
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: [
        `${__dirname}/../../.env`,      // apps/api/dist/../../.env → apps/api/.env (prod)
        `${process.cwd()}/apps/api/.env`, // monorepo root invocation
        `${process.cwd()}/.env`,          // apps/api/ direct invocation
        '.env',                           // fallback
      ],
    }),

    // Database — TypeORM with PostgreSQL
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false, // Never true in production — use migrations
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Rate limiting — in-memory store for MVP, swap to Redis adapter for prod
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (_config: ConfigService) => ({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 10 },    // 10 req/sec burst
          { name: 'medium', ttl: 60000, limit: 100 },  // 100 req/min
        ],
      }),
    }),

    // BullMQ — Background job queues backed by Redis
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
        },
      }),
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    TenantsModule,
    SchoolsModule,
    StudentsModule,
    FleetModule,
    TelemetryModule,
    TrackingModule,
    AttendanceModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
