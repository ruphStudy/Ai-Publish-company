import { Injectable } from '@nestjs/common';
import { NotificationChannelAdapterRegistry } from './adapters/notification-channel.adapters';
import { notificationDefaultPolicy } from './config/notification.config';
import { NotificationDeliveryStatus, NotificationFailureCategory } from './entities/notification.entity';
import type { NotificationDeliveryDocument, NotificationDocument } from './entities/notification.entity';
import { NotificationDeliveryRepository } from './notification.repository';

@Injectable()
export class NotificationDispatcher {
  constructor(private readonly adapters: NotificationChannelAdapterRegistry, private readonly deliveries: NotificationDeliveryRepository) {}

  async dispatch(notification: NotificationDocument, delivery: NotificationDeliveryDocument) {
    const adapter = this.adapters.resolve(delivery.channel);
    if (!adapter?.isEnabled()) return this.deliveries.update(delivery.deliveryId, { status: NotificationDeliveryStatus.SUPPRESSED, failureCode: 'CHANNEL_DISABLED', failureCategory: NotificationFailureCategory.PERMANENT });
    await this.deliveries.update(delivery.deliveryId, { status: NotificationDeliveryStatus.PROCESSING, attemptCount: delivery.attemptCount + 1 });
    const result = await adapter.send({ notificationId: notification.notificationId, eventId: notification.eventId, recipient: { userId: notification.recipientUserId, workspaceId: notification.workspaceId }, title: notification.title, message: notification.message, body: notification.body, actionUrl: notification.actionUrl, metadata: notification.metadata });
    if (result.delivered) return this.deliveries.update(delivery.deliveryId, { status: NotificationDeliveryStatus.DELIVERED, deliveredAt: new Date(), providerReference: result.providerReference ?? null });
    const retrying = Boolean(result.retryable) && delivery.attemptCount + 1 < notificationDefaultPolicy.retryLimit;
    return this.deliveries.update(delivery.deliveryId, { status: retrying ? NotificationDeliveryStatus.RETRYING : NotificationDeliveryStatus.FAILED, scheduledAt: retrying ? new Date(Date.now() + notificationDefaultPolicy.retryDelayMs) : delivery.scheduledAt, failureCategory: result.retryable ? NotificationFailureCategory.TRANSIENT : NotificationFailureCategory.PERMANENT, failureCode: result.failureCode ?? 'CHANNEL_DELIVERY_FAILED', failureMessage: result.failureMessage ?? 'Notification delivery failed' });
  }
}
