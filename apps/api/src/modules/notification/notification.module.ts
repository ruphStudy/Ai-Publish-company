import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationChannelAdapterRegistry, EmailNotificationAdapter, InAppNotificationAdapter, WebhookNotificationAdapter } from './adapters/notification-channel.adapters';
import { Notification, NotificationDelivery, NotificationDeliverySchema, NotificationPreference, NotificationPreferenceSchema, NotificationSchema, NotificationSubscription, NotificationSubscriptionSchema, NotificationWebhookEndpoint, NotificationWebhookEndpointSchema } from './entities/notification.entity';
import { NotificationController } from './notification.controller';
import { NotificationDeliveryWorker } from './notification-delivery.worker';
import { NotificationDispatcher } from './notification-dispatcher';
import { NotificationMapper } from './notification.mapper';
import { NotificationQueryService } from './notification-query.service';
import { NotificationRecipientResolver } from './notification-recipient.resolver';
import { NotificationRegistry } from './notification.registry';
import { NotificationDeliveryRepository, NotificationPreferenceRepository, NotificationRepository, NotificationSubscriptionRepository, NotificationWebhookEndpointRepository } from './notification.repository';
import { NotificationService } from './notification.service';
import { NotificationTemplateRenderer } from './notification-template.renderer';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationDelivery.name, schema: NotificationDeliverySchema },
      { name: NotificationPreference.name, schema: NotificationPreferenceSchema },
      { name: NotificationSubscription.name, schema: NotificationSubscriptionSchema },
      { name: NotificationWebhookEndpoint.name, schema: NotificationWebhookEndpointSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationRegistry,
    NotificationService,
    NotificationQueryService,
    NotificationMapper,
    NotificationRepository,
    NotificationDeliveryRepository,
    NotificationPreferenceRepository,
    NotificationSubscriptionRepository,
    NotificationWebhookEndpointRepository,
    NotificationRecipientResolver,
    NotificationTemplateRenderer,
    NotificationDispatcher,
    NotificationDeliveryWorker,
    InAppNotificationAdapter,
    EmailNotificationAdapter,
    WebhookNotificationAdapter,
    NotificationChannelAdapterRegistry,
  ],
  exports: [NotificationRegistry, NotificationService, NotificationQueryService, NotificationDispatcher, NotificationDeliveryWorker],
})
export class NotificationModule {}
