import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsTelemetryEntity } from './gps-telemetry.entity';
import { TelemetryService } from './telemetry.service';

@Module({
  imports: [TypeOrmModule.forFeature([GpsTelemetryEntity])],
  providers: [TelemetryService],
  exports: [TelemetryService],
})
export class TelemetryModule {}
