import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as admin from 'firebase-admin';
import { withTenant } from '../../common/tenant-context';
import { NotificationEntity } from './notification.entity';
import { UserEntity } from '../users/user.entity';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super();
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(), // Relies on GOOGLE_APPLICATION_CREDENTIALS
        });
      } catch (err) {
        this.logger.warn('Firebase Admin SDK not initialized. Push notifications will fail.');
      }
    }
  }

  async process(job: Job<{ notificationId: string; tenantId?: string }>): Promise<void> {
    const { notificationId, tenantId } = job.data;
    if (!tenantId) {
      this.logger.error(`Notification job ${job.id} is missing tenantId`);
      return;
    }

    const loaded = await withTenant(this.dataSource, tenantId, async (manager) => {
      const notification = await manager.getRepository(NotificationEntity).findOne({
        where: { id: notificationId, tenantId },
      });
      if (!notification) return null;
      const user = await manager.getRepository(UserEntity).findOne({
        where: { id: notification.recipientId, tenantId },
        select: ['id', 'fcmToken'],
      });
      return { notification, user };
    });

    if (!loaded) {
      this.logger.error(`Notification ${notificationId} not found`);
      return;
    }

    const { notification, user } = loaded;

    if (!user || !user.fcmToken) {
      this.logger.debug(`User ${notification.recipientId} has no FCM token. Skipping push.`);
      return;
    }

    if (notification.channel === 'fcm' && admin.apps.length) {
      try {
        await admin.messaging().send({
          token: user.fcmToken,
          notification: {
            title: notification.title,
            body: notification.body,
          },
          data: notification.data as Record<string, string>,
        });
        
        await withTenant(this.dataSource, tenantId, (manager) =>
          manager.getRepository(NotificationEntity).update({ id: notification.id, tenantId }, { sentAt: new Date() }),
        );
        this.logger.log(`Sent FCM push to user ${user.id} for notification ${notification.id}`);
      } catch (err) {
        this.logger.error(`FCM send failed for user ${user.id}`, err);
        throw err; // triggers BullMQ retry
      }
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
