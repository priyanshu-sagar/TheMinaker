import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationEntity } from './notification.entity';

export interface SendNotificationDto {
  tenantId: string;
  recipientId: string;
  type: 'student_arrived' | 'student_departed' | 'bus_arriving' | 'bus_delayed' | 'attendance_marked' | 'report_ready';
  title: string;
  body: string;
  data?: Record<string, unknown>;
  channel?: 'fcm' | 'sms' | 'in_app';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
    @InjectQueue('notifications') private readonly queue: Queue,
  ) {}

  /** Create notification in DB and enqueue job for delivery */
  async send(dto: SendNotificationDto): Promise<NotificationEntity> {
    const notification = this.repo.create({
      ...dto,
      channel: dto.channel ?? 'fcm',
    });
    
    const saved = await this.repo.save(notification);

    await this.queue.add('deliver', { notificationId: saved.id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    return saved;
  }

  async getMyNotifications(recipientId: string, tenantId: string): Promise<NotificationEntity[]> {
    return this.repo.find({
      where: { recipientId, tenantId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markAsRead(id: string, recipientId: string, tenantId: string): Promise<void> {
    await this.repo.update({ id, recipientId, tenantId }, { readAt: new Date() });
  }

  async markAllAsRead(recipientId: string, tenantId: string): Promise<void> {
    await this.repo.update(
      { recipientId, tenantId, readAt: undefined as any }, // 'as any' handled via QueryBuilder normally, but this is simple enough if we query where readAt IS NULL
      { readAt: new Date() }
    );
  }
}
