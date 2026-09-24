import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsObject } from 'class-validator';
import { UserRole } from '@minaker/shared-types';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { SchoolsService } from './schools.service';

class UpdateSettingsDto {
  @IsObject()
  settings!: Record<string, unknown>;
}

@ApiTags('schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'schools', version: '1' })
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Get('me')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: "Get current school's profile" })
  getProfile(@TenantId() tenantId: string) {
    return this.schoolsService.findById(tenantId);
  }

  @Patch('me/settings')
  @Roles(UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update school settings (school-admin only)' })
  updateSettings(
    @TenantId() tenantId: string,
    @Body() dto: UpdateSettingsDto,
  ) {
    return this.schoolsService.updateSettings(tenantId, dto.settings);
  }
}
