import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import type { FilterQuery } from 'mongoose';
import { NotificationChannel, NotificationDeliveryStatus, NotificationStatus } from './entities/notification.entity';
import type { Notification } from './entities/notification.entity';
import type { EmitNotificationEventDto, NotificationQueryDto, UpdateNotificationPreferencesDto } from './dto/notification.dto';
import { NotificationRegistry } from './notification.registry';
import { NotificationRepository, NotificationDeliveryRepository, NotificationPreferenceRepository, NotificationSubscriptionRepository, NotificationWebhookEndpointRepository } from './notification.repository';
import { NotificationRecipientResolver } from './notification-recipient.resolver';
import { NotificationTemplateRenderer } from './notification-template.renderer';
import { notificationDefaultPolicy } from './config/notification.config';

@Injectable()
export class NotificationService {
  constructor(private readonly registry: NotificationRegistry, private readonly notifications: NotificationRepository, private readonly deliveries: NotificationDeliveryRepository, private readonly preferences: NotificationPreferenceRepository, private readonly subscriptions: NotificationSubscriptionRepository, private readonly webhooks: NotificationWebhookEndpointRepository, private readonly recipients: NotificationRecipientResolver, private readonly templates: NotificationTemplateRenderer) {}

  async emit(dto: EmitNotificationEventDto, actorUserId?: string) {
    const definition = this.registry.definition(dto.eventKey);
    if (!definition) throw new BadRequestException('Notification event is not registered');
    const eventId = dto.eventId ?? `NEV-${randomUUID()}`;
    const event = { eventId, eventKey: dto.eventKey, category: definition.category, workspaceId: dto.workspaceId ?? null, tenantId: dto.tenantId ?? null, actorUserId: actorUserId ?? null, entityType: dto.entityType ?? null, entityId: dto.entityId ?? null, recipientUserIds: dto.recipientUserIds ?? (actorUserId ? [actorUserId] : []), payload: dto.payload ?? {}, correlationId: dto.correlationId ?? null };
    const recipients = await this.recipients.resolve(event, definition);
    const created = [];
    for (const recipient of recipients) {
      const deduplicationKey = this.deduplicationKey(dto.eventKey, recipient.userId, dto.entityType, dto.entityId, definition.deduplicationPolicy === 'EVENT_RECIPIENT_OCCURRENCE' ? eventId : null);
      const existing = await this.notifications.findByDeduplicationKey(recipient.userId, dto.eventKey, deduplicationKey);
      if (existing) { created.push(existing); continue; }
      const template = this.registry.template(definition.templateKeys[NotificationChannel.IN_APP] ?? 'generic.in_app');
      if (!template) throw new BadRequestException('Notification template is not registered');
      const variables = { title: dto.payload?.title ?? definition.displayName, message: dto.payload?.message ?? definition.description, body: dto.payload?.body ?? definition.description, actionLabel: dto.payload?.actionLabel ?? 'Open', actionUrl: dto.payload?.actionUrl ?? null };
      const rendered = this.templates.render(template, variables);
      const expiresAt = new Date(Date.now() + (definition.expirationMs ?? notificationDefaultPolicy.defaultExpirationMs));
      const notification = await this.notifications.create({ eventId, eventKey: dto.eventKey, category: definition.category, severity: definition.defaultSeverity, status: NotificationStatus.UNREAD, recipientUserId: recipient.userId, workspaceId: dto.workspaceId ?? null, tenantId: dto.tenantId ?? null, entityType: dto.entityType ?? null, entityId: dto.entityId ?? null, title: rendered.title, message: rendered.message, body: rendered.body, actionLabel: rendered.actionLabel, actionUrl: rendered.actionUrl, actionMetadata: definition.actionMetadata ?? {}, metadata: this.safeMetadata(dto.payload ?? {}), deduplicationKey, expiresAt, correlationId: dto.correlationId ?? null, createdBy: actorUserId ?? null, updatedBy: actorUserId ?? null });
      for (const channel of definition.defaultChannels.filter((channel) => notificationDefaultPolicy.enabledChannels.includes(channel))) await this.deliveries.create({ notificationId: notification.notificationId, eventId, recipientUserId: recipient.userId, channel, status: NotificationDeliveryStatus.PENDING, workspaceId: dto.workspaceId ?? null, tenantId: dto.tenantId ?? null, attemptCount: 0, scheduledAt: new Date(), idempotencyKey: this.deduplicationKey(dto.eventKey, recipient.userId, channel, dto.entityId, eventId), correlationId: dto.correlationId ?? null });
      created.push(notification);
    }
    return created;
  }

  list(userId: string, query: NotificationQueryDto) {
    const filter: FilterQuery<Notification> = { recipientUserId: userId };
    if (query.workspaceId) filter.workspaceId = query.workspaceId;
    if (query.category) filter.category = query.category;
    if (query.severity) filter.severity = query.severity;
    if (query.status) filter.status = query.status;
    return this.notifications.paginate(filter, query.page, query.limit);
  }

  unreadCount(userId: string, workspaceId?: string) { return this.notifications.unreadCount(userId, workspaceId); }
  async get(userId: string, id: string) { const notification = await this.notifications.findById(id); if (!notification || notification.recipientUserId !== userId) throw new NotFoundException('Notification not found'); return notification; }
  async markRead(userId: string, id: string) { await this.get(userId, id); return this.notifications.update(id, { status: NotificationStatus.READ, readAt: new Date(), updatedBy: userId }); }
  async markUnread(userId: string, id: string) { await this.get(userId, id); return this.notifications.update(id, { status: NotificationStatus.UNREAD, readAt: null, updatedBy: userId }); }
  async archive(userId: string, id: string) { await this.get(userId, id); return this.notifications.update(id, { status: NotificationStatus.ARCHIVED, archivedAt: new Date(), updatedBy: userId }); }
  markAllRead(userId: string, workspaceId?: string) { return this.notifications.markAllRead(userId, workspaceId); }
  updatePreferences(userId: string, dto: UpdateNotificationPreferencesDto) { return this.preferences.upsert({ scope: 'USER', userId, workspaceId: dto.workspaceId ?? null, eventKey: dto.eventKey ?? null, category: dto.category ?? null }, { scope: 'USER', userId, workspaceId: dto.workspaceId ?? null, eventKey: dto.eventKey ?? null, category: dto.category ?? null, enabledChannels: dto.enabledChannels, enabled: dto.enabled, quietHours: dto.quietHours ?? {} }); }
  preferencesFor(userId: string, workspaceId?: string) { return this.preferences.find({ userId, ...(workspaceId ? { workspaceId } : {}) }); }
  deliveryHistory(query: { notificationId?: string; workspaceId?: string; channel?: NotificationChannel; page?: number; limit?: number }) { return this.deliveries.paginate({ ...(query.notificationId ? { notificationId: query.notificationId } : {}), ...(query.workspaceId ? { workspaceId: query.workspaceId } : {}), ...(query.channel ? { channel: query.channel } : {}) }, query.page, query.limit); }
  retryDelivery(id: string) { return this.deliveries.update(id, { status: NotificationDeliveryStatus.RETRYING, scheduledAt: new Date() }); }
  subscriptions(query: { workspaceId?: string; eventKey?: string; page?: number; limit?: number }) { return this.subscriptions.search({ ...(query.workspaceId ? { workspaceId: query.workspaceId } : {}), ...(query.eventKey ? { eventKey: query.eventKey } : {}) }, query.page, query.limit); }
  webhookEndpoints(workspaceId: string, page?: number, limit?: number) { return this.webhooks.search({ workspaceId }, page, limit); }

  private deduplicationKey(...parts: Array<string | null | undefined>) { return createHash('sha256').update(parts.filter(Boolean).join(':')).digest('hex'); }
  private safeMetadata(metadata: Record<string, unknown>) { const blocked = new Set(['secret', 'token', 'password', 'credential', 'stack', 'prompt']); return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blocked.has(key.toLowerCase()))); }
}
