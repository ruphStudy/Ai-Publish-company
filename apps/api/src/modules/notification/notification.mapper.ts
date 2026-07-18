import { Injectable } from '@nestjs/common';
import type { NotificationDeliveryDocument, NotificationDocument, NotificationPreferenceDocument, NotificationSubscriptionDocument, NotificationWebhookEndpointDocument } from './entities/notification.entity';

@Injectable()
export class NotificationMapper {
  notification(document: NotificationDocument) {
    return document.toObject();
  }

  delivery(document: NotificationDeliveryDocument) {
    return document.toObject();
  }

  preference(document: NotificationPreferenceDocument) {
    return document.toObject();
  }

  subscription(document: NotificationSubscriptionDocument) {
    return document.toObject();
  }

  webhookEndpoint(document: NotificationWebhookEndpointDocument) {
    const { secretHash: _secretHash, ...safe } = document.toObject();
    return safe;
  }
}
