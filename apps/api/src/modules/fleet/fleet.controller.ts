import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsEnum, IsUUID } from 'class-validator';
import { AuthUser, UserRole } from '@minaker/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { FleetService } from './fleet.service';

class StartTripDto {
  @IsUUID()
  busId!: string;

  @IsUUID()
  routeId!: string;

  @IsEnum(['morning', 'afternoon', 'custom'])
  tripType!: 'morning' | 'afternoon' | 'custom';
}

class EndTripDto {
  @IsUUID()
  tripId!: string;
}

@ApiTags('fleet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'fleet', version: '1' })
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // ─── Routes ─────────────────────────────────────────────────

  @Get('routes')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR, UserRole.PARENT)
  @ApiOperation({ summary: 'List all active routes' })
  getRoutes(@TenantId() tenantId: string) {
    return this.fleetService.findAllRoutes(tenantId);
  }

  @Get('routes/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR, UserRole.PARENT)
  @ApiOperation({ summary: 'Get a route with stop list' })
  getRoute(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.fleetService.findRouteById(id, tenantId);
  }

  // ─── Buses ──────────────────────────────────────────────────

  @Get('buses')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR, UserRole.PARENT)
  @ApiOperation({ summary: 'List all buses' })
  getBuses(@TenantId() tenantId: string) {
    return this.fleetService.findAllBuses(tenantId);
  }

  @Get('buses/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'Get a bus by ID' })
  getBus(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.fleetService.findBusById(id, tenantId);
  }

  @Get('buses/:id/trips')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'Get recent trips for a bus' })
  getBusTrips(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.fleetService.findTripsByBus(id, tenantId);
  }

  // ─── Trips ──────────────────────────────────────────────────

  @Get('trips/active')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'List active trips for the tenant' })
  getActiveTrips(@TenantId() tenantId: string) {
    return this.fleetService.findActiveTrips(tenantId);
  }

  @Get('trips/my-active')
  @Roles(UserRole.CONDUCTOR)
  @ApiOperation({ summary: "Conductor's current active trip (used on app launch)" })
  getMyActiveTrip(@CurrentUser() user: AuthUser, @TenantId() tenantId: string) {
    return this.fleetService.getActiveTripForConductor(user.id, tenantId);
  }

  @Post('trips/start')
  @Roles(UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'Conductor starts a trip' })
  startTrip(
    @CurrentUser() user: AuthUser,
    @TenantId() tenantId: string,
    @Body() dto: StartTripDto,
  ) {
    return this.fleetService.startTrip(tenantId, user.id, dto.busId, dto.routeId, dto.tripType);
  }

  @Post('trips/end')
  @Roles(UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'Conductor ends the active trip' })
  endTrip(
    @CurrentUser() user: AuthUser,
    @TenantId() tenantId: string,
    @Body() dto: EndTripDto,
  ) {
    return this.fleetService.endTrip(dto.tripId, tenantId, user.id);
  }
}
