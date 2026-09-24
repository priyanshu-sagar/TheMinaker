import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusEntity } from './bus.entity';
import { RouteEntity } from './route.entity';
import { TripEntity } from './trip.entity';
import { FleetService } from './fleet.service';
import { FleetController } from './fleet.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BusEntity, RouteEntity, TripEntity])],
  providers: [FleetService],
  controllers: [FleetController],
  exports: [FleetService, TypeOrmModule],
})
export class FleetModule {}
