import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusEntity } from './bus.entity';
import { RouteEntity } from './route.entity';
import { TripEntity } from './trip.entity';

@Injectable()
export class FleetService {
  constructor(
    @InjectRepository(BusEntity)
    private readonly busRepo: Repository<BusEntity>,
    @InjectRepository(RouteEntity)
    private readonly routeRepo: Repository<RouteEntity>,
    @InjectRepository(TripEntity)
    private readonly tripRepo: Repository<TripEntity>,
  ) {}

  // ─── Routes ─────────────────────────────────────────────────

  findAllRoutes(tenantId: string) {
    return this.routeRepo.find({ where: { tenantId, status: 'active' } });
  }

  findRouteById(id: string, tenantId: string) {
    return this.routeRepo.findOne({ where: { id, tenantId } });
  }

  // ─── Buses ──────────────────────────────────────────────────

  findAllBuses(tenantId: string) {
    return this.busRepo.find({ where: { tenantId }, order: { numberPlate: 'ASC' } });
  }

  findBusById(id: string, tenantId: string) {
    return this.busRepo.findOne({ where: { id, tenantId } });
  }

  async assignConductor(busId: string, conductorId: string, tenantId: string): Promise<void> {
    await this.busRepo.update({ id: busId, tenantId }, { conductorId });
  }

  // ─── Trips ──────────────────────────────────────────────────

  findActiveTrips(tenantId: string) {
    return this.tripRepo.find({
      where: { tenantId, status: 'active' },
      order: { createdAt: 'DESC' },
    });
  }

  async findTripsByBus(busId: string, tenantId: string) {
    return this.tripRepo.find({
      where: { busId, tenantId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
  }

  async findTripById(id: string, tenantId: string): Promise<TripEntity> {
    const trip = await this.tripRepo.findOne({ where: { id, tenantId } });
    if (!trip) throw new NotFoundException(`Trip ${id} not found`);
    return trip;
  }

  /** Conductor starts a trip — creates an active trip record. */
  async startTrip(
    tenantId: string,
    conductorId: string,
    busId: string,
    routeId: string,
    tripType: 'morning' | 'afternoon' | 'custom',
  ): Promise<TripEntity> {
    // Enforce one active trip per bus at a time
    const existing = await this.tripRepo.findOne({
      where: { busId, tenantId, status: 'active' },
    });
    if (existing) throw new BadRequestException('This bus already has an active trip');

    const trip = this.tripRepo.create({
      tenantId,
      busId,
      routeId,
      conductorId,
      tripType,
      status: 'active',
      startedAt: new Date(),
    });
    return this.tripRepo.save(trip);
  }

  /** Conductor ends a trip. */
  async endTrip(tripId: string, tenantId: string, conductorId: string): Promise<TripEntity> {
    const trip = await this.findTripById(tripId, tenantId);
    if (trip.conductorId !== conductorId) {
      throw new BadRequestException('Only the assigned conductor can end this trip');
    }
    if (trip.status !== 'active') {
      throw new BadRequestException(`Trip is already ${trip.status}`);
    }
    trip.status = 'completed';
    trip.completedAt = new Date();
    return this.tripRepo.save(trip);
  }

  /** Get conductor's current active trip (used by mobile on app start). */
  async getActiveTripForConductor(conductorId: string, tenantId: string): Promise<TripEntity | null> {
    return this.tripRepo.findOne({
      where: { conductorId, tenantId, status: 'active' },
    });
  }
}
