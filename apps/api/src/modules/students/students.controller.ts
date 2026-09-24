import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@minaker/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { StudentsService } from './students.service';

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, TenantGuard)
@Controller({ path: 'students', version: '1' })
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Roles(
    UserRole.SCHOOL_ADMIN,
    UserRole.TEACHER,
    UserRole.GATEKEEPER,
    UserRole.CONDUCTOR,
  )
  @ApiOperation({ summary: 'List active students for the current tenant' })
  findAll(@TenantId() tenantId: string) {
    return this.studentsService.findByTenant(tenantId);
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.GATEKEEPER, UserRole.CONDUCTOR)
  @ApiOperation({ summary: 'Get a student by ID' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.studentsService.findById(id, tenantId);
  }
}
