import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthUser } from '@minaker/shared-types';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantId } from '../../common/decorators/tenant-id.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, TenantGuard) // All authenticated users can read their own notifications
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my recent notifications' })
  getMyNotifications(@CurrentUser() user: AuthUser, @TenantId() tenantId: string) {
    return this.notificationsService.getMyNotifications(user.id, tenantId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @TenantId() tenantId: string,
  ) {
    return this.notificationsService.markAsRead(id, user.id, tenantId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@CurrentUser() user: AuthUser, @TenantId() tenantId: string) {
    return this.notificationsService.markAllAsRead(user.id, tenantId);
  }
}
