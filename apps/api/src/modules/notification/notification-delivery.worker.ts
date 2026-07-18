import { Injectable } from '@nestjs/common';
import { NotificationDeliveryStatus } from './entities/notification.entity';
import { NotificationDispatcher } from './notification-dispatcher';
import { NotificationDeliveryRepository, NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationDeliveryWorker {
  constructor(
    private readonly notifications: NotificationRepository,
    private readonly deliveries: NotificationDeliveryRepository,
    private readonly dispatcher: NotificationDispatcher,
  ) {}

  async processPending(limit = 50) {
    const pending = await this.deliveries.findPending(limit);
    const processed = [];

    for (const delivery of pending) {
      const notification = await this.notifications.findById(delivery.notificationId);
      if (!notification) {
        processed.push(await this.deliveries.update(delivery.deliveryId, { status: NotificationDeliveryStatus.FAILED, failureCode: 'NOTIFICATION_NOT_FOUND', failureMessage: 'Notification record is missing' }));
        continue;
      }

      processed.push(await this.dispatcher.dispatch(notification, delivery));
    }

    return processed;
  }
}
