import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as admin from 'firebase-admin';
import { NotificationEntity } from './notification.entity';
import { UserEntity } from '../users/user.entity';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationsProcessor.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {
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

  async process(job: Job<{ notificationId: string }>): Promise<void> {
    const { notificationId } = job.data;
    
    const notification = await this.notificationRepo.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      this.logger.error(`Notification ${notificationId} not found`);
      return;
    }

    const user = await this.userRepo.findOne({
      where: { id: notification.recipientId },
      select: ['id', 'fcmToken'],
    });

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
        
        await this.notificationRepo.update(notification.id, { sentAt: new Date() });
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
