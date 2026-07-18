import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Notification, NotificationDelivery, NotificationDeliveryDocument, NotificationDocument, NotificationPreference, NotificationPreferenceDocument, NotificationStatus, NotificationSubscription, NotificationSubscriptionDocument, NotificationWebhookEndpoint, NotificationWebhookEndpointDocument } from './entities/notification.entity';

@Injectable()
export class NotificationRepository {
  constructor(@InjectModel(Notification.name) private readonly model: Model<NotificationDocument>) {}
  create(input: Partial<Notification>) { return this.model.create({ notificationId: input.notificationId ?? `NTF-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<Notification>) { return this.model.findOneAndUpdate({ notificationId: id }, update, { new: true }).exec(); }
  findById(id: string) { return this.model.findOne({ notificationId: id }).exec(); }
  findByDeduplicationKey(recipientUserId: string, eventKey: string, deduplicationKey: string) { return this.model.findOne({ recipientUserId, eventKey, deduplicationKey }).exec(); }
  unreadCount(userId: string, workspaceId?: string) { return this.model.countDocuments({ recipientUserId: userId, status: NotificationStatus.UNREAD, ...(workspaceId ? { workspaceId } : {}) }).exec(); }
  paginate(filter: FilterQuery<Notification>, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    return Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Math.max(limit, 1), 100)).exec(),
      this.model.countDocuments(filter).exec(),
    ]).then(([items, total]) => ({ items, total, page, limit }));
  }
  markAllRead(userId: string, workspaceId?: string) { return this.model.updateMany({ recipientUserId: userId, status: NotificationStatus.UNREAD, ...(workspaceId ? { workspaceId } : {}) }, { status: NotificationStatus.READ, readAt: new Date() }).exec(); }
}

@Injectable()
export class NotificationDeliveryRepository {
  constructor(@InjectModel(NotificationDelivery.name) private readonly model: Model<NotificationDeliveryDocument>) {}
  create(input: Partial<NotificationDelivery>) { return this.model.create({ deliveryId: input.deliveryId ?? `NDL-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<NotificationDelivery>) { return this.model.findOneAndUpdate({ deliveryId: id }, update, { new: true }).exec(); }
  findById(id: string) { return this.model.findOne({ deliveryId: id }).exec(); }
  findPending(limit = 50) { return this.model.find({ status: { $in: ['PENDING', 'QUEUED', 'RETRYING'] }, scheduledAt: { $lte: new Date() } }).sort({ scheduledAt: 1 }).limit(limit).exec(); }
  paginate(filter: FilterQuery<NotificationDelivery>, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Math.max(limit, 1), 100)).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit }));
  }
}

@Injectable()
export class NotificationPreferenceRepository {
  constructor(@InjectModel(NotificationPreference.name) private readonly model: Model<NotificationPreferenceDocument>) {}
  upsert(filter: FilterQuery<NotificationPreference>, update: Partial<NotificationPreference>) { return this.model.findOneAndUpdate(filter, { $set: update }, { upsert: true, new: true }).exec(); }
  find(filter: FilterQuery<NotificationPreference>) { return this.model.find(filter).exec(); }
}

@Injectable()
export class NotificationSubscriptionRepository {
  constructor(@InjectModel(NotificationSubscription.name) private readonly model: Model<NotificationSubscriptionDocument>) {}
  create(input: Partial<NotificationSubscription>) { return this.model.create({ subscriptionId: input.subscriptionId ?? `NSB-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<NotificationSubscription>) { return this.model.findOneAndUpdate({ subscriptionId: id }, update, { new: true }).exec(); }
  search(filter: FilterQuery<NotificationSubscription>, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Math.max(limit, 1), 100)).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit }));
  }
}

@Injectable()
export class NotificationWebhookEndpointRepository {
  constructor(@InjectModel(NotificationWebhookEndpoint.name) private readonly model: Model<NotificationWebhookEndpointDocument>) {}
  create(input: Partial<NotificationWebhookEndpoint>) { return this.model.create({ webhookEndpointId: input.webhookEndpointId ?? `NWH-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<NotificationWebhookEndpoint>) { return this.model.findOneAndUpdate({ webhookEndpointId: id }, update, { new: true }).exec(); }
  findById(id: string) { return this.model.findOne({ webhookEndpointId: id }).exec(); }
  search(filter: FilterQuery<NotificationWebhookEndpoint>, page = 1, limit = 20) {
    const skip = (Math.max(page, 1) - 1) * Math.min(Math.max(limit, 1), 100);
    return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Math.min(Math.max(limit, 1), 100)).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit }));
  }
}
