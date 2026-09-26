import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { withTenant } from '../../common/tenant-context';
import { BusEntity } from './bus.entity';
import { RouteEntity } from './route.entity';
import { TripEntity } from './trip.entity';

@Injectable()
export class FleetService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  findAllRoutes(tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.routes(manager).find({ where: { tenantId, status: 'active' } }),
    );
  }

  findRouteById(id: string, tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.routes(manager).findOne({ where: { id, tenantId } }),
    );
  }

  findAllBuses(tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.buses(manager).find({ where: { tenantId }, order: { numberPlate: 'ASC' } }),
    );
  }

  findBusById(id: string, tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.buses(manager).findOne({ where: { id, tenantId } }),
    );
  }

  async assignConductor(busId: string, conductorId: string, tenantId: string): Promise<void> {
    await withTenant(this.dataSource, tenantId, (manager) =>
      this.buses(manager).update({ id: busId, tenantId }, { conductorId }),
    );
  }

  findActiveTrips(tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.trips(manager).find({
        where: { tenantId, status: 'active' },
        order: { createdAt: 'DESC' },
      }),
    );
  }

  findTripsByBus(busId: string, tenantId: string) {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.trips(manager).find({
        where: { busId, tenantId },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    );
  }

  async findTripById(id: string, tenantId: string): Promise<TripEntity> {
    const trip = await withTenant(this.dataSource, tenantId, (manager) =>
      this.trips(manager).findOne({ where: { id, tenantId } }),
    );
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return trip;
  }

  async startTrip(
    tenantId: string,
    conductorId: string,
    busId: string,
    routeId: string,
    tripType: 'morning' | 'afternoon' | 'custom',
  ): Promise<TripEntity> {
    return withTenant(this.dataSource, tenantId, async (manager) => {
      const trips = this.trips(manager);
      const existing = await trips.findOne({
        where: { busId, tenantId, status: 'active' },
      });
      if (existing) throw new BadRequestException('This bus already has an active trip');

      const trip = trips.create({
        tenantId,
        busId,
        routeId,
        conductorId,
        tripType,
        status: 'active',
        startedAt: new Date(),
      });
      return trips.save(trip);
    });
  }

  async endTrip(tripId: string, tenantId: string, conductorId: string): Promise<TripEntity> {
    return withTenant(this.dataSource, tenantId, async (manager) => {
      const trips = this.trips(manager);
      const trip = await trips.findOne({ where: { id: tripId, tenantId } });
      if (!trip) throw new NotFoundException(`Trip ${tripId} not found`);
      if (trip.conductorId !== conductorId) {
        throw new BadRequestException('Only the assigned conductor can end this trip');
      }
      if (trip.status !== 'active') {
        throw new BadRequestException(`Trip is already ${trip.status}`);
      }
      trip.status = 'completed';
      trip.completedAt = new Date();
      return trips.save(trip);
    });
  }

  getActiveTripForConductor(conductorId: string, tenantId: string): Promise<TripEntity | null> {
    return withTenant(this.dataSource, tenantId, (manager) =>
      this.trips(manager).findOne({
        where: { conductorId, tenantId, status: 'active' },
      }),
    );
  }

  private routes(manager: EntityManager) {
    return manager.getRepository(RouteEntity);
  }

  private buses(manager: EntityManager) {
    return manager.getRepository(BusEntity);
  }

  private trips(manager: EntityManager) {
    return manager.getRepository(TripEntity);
  }
}
