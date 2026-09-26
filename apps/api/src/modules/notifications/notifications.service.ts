import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DataSource } from 'typeorm';
import { withTenant } from '../../common/tenant-context';
import { NotificationEntity } from './notification.entity';

export interface SendNotificationDto {
  tenantId: string;
  recipientId: string;
  type:
    | 'student_arrived'
    | 'student_departed'
    | 'bus_arriving'
    | 'bus_delayed'
    | 'attendance_marked'
    | 'report_ready';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel?: 'fcm' | 'sms' | 'in_app';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  async send(dto: SendNotificationDto): Promise<NotificationEntity> {
    const saved = await withTenant(this.dataSource, dto.tenantId, (manager) => {
      const repo = manager.getRepository(NotificationEntity);
      const notification = repo.create({
        ...dto,
        channel: dto.channel ?? 'fcm',
      });
      return repo.save(notification);
    });

    await this.queue.add(
      'deliver',
      { notificationId: saved.id, tenantId: dto.tenantId },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    this.logger.debug(`Queued notification ${saved.id}`);
    return saved;
  }

  getMyNotifications(recipientId: string, tenantId: string): Promise<NotificationEntity[]> {
    return withTenant(this.dataSource, tenantId, (manager) =>
      manager.getRepository(NotificationEntity).find({
        where: { recipientId, tenantId },
        order: { createdAt: 'DESC' },
        take: 50,
      }),
    );
  }

  async markAsRead(id: string, recipientId: string, tenantId: string): Promise<void> {
    await withTenant(this.dataSource, tenantId, (manager) =>
      manager.getRepository(NotificationEntity).update({ id, recipientId, tenantId }, { readAt: new Date() }),
    );
  }

  async markAllAsRead(recipientId: string, tenantId: string): Promise<void> {
    await withTenant(this.dataSource, tenantId, (manager) =>
      manager
        .createQueryBuilder()
        .update(NotificationEntity)
        .set({ readAt: new Date() })
        .where('recipient_id = :recipientId AND tenant_id = :tenantId AND read_at IS NULL', {
          recipientId,
          tenantId,
        })
        .execute(),
    );
  }
}
