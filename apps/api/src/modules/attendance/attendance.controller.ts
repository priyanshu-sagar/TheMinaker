import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AttendanceStatus,
  AttendanceType,
  AuthUser,
  MarkAttendanceBatchRequest,
  MarkAttendanceRequest,
  UserRole,
} from '@minaker/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { AttendanceService } from './attendance.service';

// ─── DTOs (match shared-types interfaces exactly) ────────────

/** Single mark — matches MarkAttendanceRequest */
class MarkDto implements MarkAttendanceRequest {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceType)
  attendanceType!: AttendanceType;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  gateLocation?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class BatchMarkItemDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsEnum(AttendanceType)
  attendanceType!: AttendanceType;

  @IsOptional()
  @IsString()
  notes?: string;
}

/** Batch mark — matches MarkAttendanceBatchRequest */
class MarkBatchDto implements MarkAttendanceBatchRequest {
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => BatchMarkItemDto)
  marks!: BatchMarkItemDto[];

  @IsEnum(AttendanceType)
  attendanceType!: AttendanceType;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  gateLocation?: string;
}

// ─── Controller ──────────────────────────────────────────────

@ApiTags('attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'attendance', version: '1' })
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * Roster with today's attendance pre-loaded.
   * Single SQL query with LEFT JOIN — gatekeeper/conductor loads this on screen open.
   */
  @Get('roster')
  @Roles(UserRole.GATEKEEPER, UserRole.CONDUCTOR, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Student roster with today attendance status pre-loaded' })
  @ApiQuery({ name: 'attendanceType', enum: AttendanceType })
  @ApiQuery({ name: 'date', required: false, description: 'YYYY-MM-DD, defaults to today UTC' })
  @ApiQuery({ name: 'classSection', required: false })
  getRoster(
    @TenantId() tenantId: string,
    @Query('attendanceType') attendanceType: AttendanceType,
    @Query('date') date?: string,
    @Query('classSection') classSection?: string,
  ) {
    return this.attendanceService.getRoster(tenantId, attendanceType, date, classSection);
  }

  /** Mark one student (upsert — safe to toggle). */
  @Post('mark')
  @Roles(UserRole.GATEKEEPER, UserRole.CONDUCTOR, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a single student attendance (idempotent upsert)' })
  mark(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkDto,
  ) {
    return this.attendanceService.mark(tenantId, dto, user.id);
  }

  /** Batch mark (max 200) — used by the mobile offline sync queue. */
  @Post('mark-batch')
  @Roles(UserRole.GATEKEEPER, UserRole.CONDUCTOR, UserRole.TEACHER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Batch mark attendance (max 200, offline-queue sync)' })
  markBatch(
    @TenantId() tenantId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkBatchDto,
  ) {
    return this.attendanceService.markBatch(tenantId, dto, user.id);
  }

  /** Daily summary counts — present / absent / late / unmarked. */
  @Get('summary')
  @Roles(UserRole.GATEKEEPER, UserRole.CONDUCTOR, UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Today's attendance summary counts" })
  @ApiQuery({ name: 'attendanceType', enum: AttendanceType })
  @ApiQuery({ name: 'date', required: false })
  getDailySummary(
    @TenantId() tenantId: string,
    @Query('attendanceType') attendanceType: AttendanceType,
    @Query('date') date?: string,
  ) {
    const effectiveDate = date ?? new Date().toISOString().split('T')[0]!;
    return this.attendanceService.getDailySummary(tenantId, effectiveDate, attendanceType);
  }
}
