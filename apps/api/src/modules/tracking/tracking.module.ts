import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TrackingGateway } from './tracking.gateway';

@Module({
  imports: [AuthModule], // Brings in JwtService
  providers: [TrackingGateway],
})
export class TrackingModule {}
