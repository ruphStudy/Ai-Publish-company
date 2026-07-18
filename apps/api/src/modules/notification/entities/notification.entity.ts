import type { HydratedDocument, Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum NotificationCategory { PUBLISHING = 'PUBLISHING', IMPORTS = 'IMPORTS', SYNCHRONIZATION = 'SYNCHRONIZATION', SALES = 'SALES', REVENUE = 'REVENUE', ROYALTIES = 'ROYALTIES', ANALYTICS = 'ANALYTICS', OPPORTUNITIES = 'OPPORTUNITIES', AI_INSIGHTS = 'AI_INSIGHTS', BACKGROUND_JOBS = 'BACKGROUND_JOBS', PROVIDER_INTEGRATIONS = 'PROVIDER_INTEGRATIONS', MARKETPLACE_INTEGRATIONS = 'MARKETPLACE_INTEGRATIONS', SECURITY = 'SECURITY', ADMINISTRATION = 'ADMINISTRATION', SYSTEM_HEALTH = 'SYSTEM_HEALTH' }
export enum NotificationSeverity { INFO = 'INFO', SUCCESS = 'SUCCESS', WARNING = 'WARNING', ERROR = 'ERROR', CRITICAL = 'CRITICAL' }
export enum NotificationChannel { IN_APP = 'IN_APP', EMAIL = 'EMAIL', WEBHOOK = 'WEBHOOK' }
export enum NotificationStatus { UNREAD = 'UNREAD', READ = 'READ', ARCHIVED = 'ARCHIVED', DISMISSED = 'DISMISSED', EXPIRED = 'EXPIRED' }
export enum NotificationDeliveryStatus { PENDING = 'PENDING', QUEUED = 'QUEUED', PROCESSING = 'PROCESSING', DELIVERED = 'DELIVERED', FAILED = 'FAILED', RETRYING = 'RETRYING', CANCELLED = 'CANCELLED', EXPIRED = 'EXPIRED', SUPPRESSED = 'SUPPRESSED' }
export enum NotificationFailureCategory { TRANSIENT = 'TRANSIENT', RATE_LIMITED = 'RATE_LIMITED', AUTHENTICATION = 'AUTHENTICATION', INVALID_RECIPIENT = 'INVALID_RECIPIENT', INVALID_ENDPOINT = 'INVALID_ENDPOINT', PERMANENT = 'PERMANENT', UNKNOWN = 'UNKNOWN' }
export enum NotificationRecipientStrategy { CURRENT_USER = 'CURRENT_USER', ASSIGNED_USER = 'ASSIGNED_USER', ENTITY_OWNER = 'ENTITY_OWNER', WORKSPACE_MEMBERS = 'WORKSPACE_MEMBERS', WORKSPACE_ADMINISTRATORS = 'WORKSPACE_ADMINISTRATORS', SYSTEM_ADMINISTRATORS = 'SYSTEM_ADMINISTRATORS', EXPLICIT_RECIPIENTS = 'EXPLICIT_RECIPIENTS', USERS_WITH_PERMISSIONS = 'USERS_WITH_PERMISSIONS', EVENT_PROVIDED_RECIPIENTS = 'EVENT_PROVIDED_RECIPIENTS' }
export enum NotificationPriority { LOW = 'LOW', NORMAL = 'NORMAL', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }

export type NotificationDocument = HydratedDocument<Notification>;
export type NotificationDeliveryDocument = HydratedDocument<NotificationDelivery>;
export type NotificationPreferenceDocument = HydratedDocument<NotificationPreference>;
export type NotificationSubscriptionDocument = HydratedDocument<NotificationSubscription>;
export type NotificationWebhookEndpointDocument = HydratedDocument<NotificationWebhookEndpoint>;

@Schema({ collection: 'notifications', timestamps: true, versionKey: 'version' })
export class Notification {
  @Prop({ required: true, unique: true, index: true }) notificationId: string;
  @Prop({ required: true, index: true }) eventId: string;
  @Prop({ required: true, index: true }) eventKey: string;
  @Prop({ type: String, enum: NotificationCategory, required: true, index: true }) category: NotificationCategory;
  @Prop({ type: String, enum: NotificationSeverity, required: true, index: true }) severity: NotificationSeverity;
  @Prop({ type: String, enum: NotificationStatus, default: NotificationStatus.UNREAD, index: true }) status: NotificationStatus;
  @Prop({ required: true, index: true }) recipientUserId: string;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) tenantId: string | null;
  @Prop({ type: String, default: null, index: true }) entityType: string | null;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) message: string;
  @Prop({ type: String, default: null }) body: string | null;
  @Prop({ type: String, default: null }) actionLabel: string | null;
  @Prop({ type: String, default: null }) actionUrl: string | null;
  @Prop({ type: Object, default: {} }) actionMetadata: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ required: true, index: true }) deduplicationKey: string;
  @Prop({ type: Date, default: null, index: true }) readAt: Date | null;
  @Prop({ type: Date, default: null, index: true }) archivedAt: Date | null;
  @Prop({ type: Date, default: null, index: true }) expiresAt: Date | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'notification_deliveries', timestamps: true, versionKey: 'version' })
export class NotificationDelivery {
  @Prop({ required: true, unique: true, index: true }) deliveryId: string;
  @Prop({ required: true, index: true }) notificationId: string;
  @Prop({ required: true, index: true }) eventId: string;
  @Prop({ required: true, index: true }) recipientUserId: string;
  @Prop({ type: String, enum: NotificationChannel, required: true, index: true }) channel: NotificationChannel;
  @Prop({ type: String, enum: NotificationDeliveryStatus, required: true, index: true }) status: NotificationDeliveryStatus;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) tenantId: string | null;
  @Prop({ default: 0, min: 0 }) attemptCount: number;
  @Prop({ type: Date, default: null, index: true }) scheduledAt: Date | null;
  @Prop({ type: Date, default: null }) deliveredAt: Date | null;
  @Prop({ type: String, default: null }) providerReference: string | null;
  @Prop({ type: String, enum: NotificationFailureCategory, default: null, index: true }) failureCategory: NotificationFailureCategory | null;
  @Prop({ type: String, default: null }) failureCode: string | null;
  @Prop({ type: String, default: null }) failureMessage: string | null;
  @Prop({ required: true, index: true }) idempotencyKey: string;
  @Prop({ type: Object, default: {} }) channelMetadata: Record<string, unknown>;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'notification_preferences', timestamps: true, versionKey: 'version' })
export class NotificationPreference {
  @Prop({ required: true, index: true }) scope: 'SYSTEM' | 'WORKSPACE' | 'USER';
  @Prop({ type: String, default: null, index: true }) userId: string | null;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) eventKey: string | null;
  @Prop({ type: String, enum: NotificationCategory, default: null, index: true }) category: NotificationCategory | null;
  @Prop({ type: [String], enum: NotificationChannel, default: [] }) enabledChannels: NotificationChannel[];
  @Prop({ default: true, index: true }) enabled: boolean;
  @Prop({ type: Object, default: {} }) quietHours: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ default: false, index: true }) isDeleted: boolean;
}

@Schema({ collection: 'notification_subscriptions', timestamps: true, versionKey: 'version' })
export class NotificationSubscription {
  @Prop({ required: true, unique: true, index: true }) subscriptionId: string;
  @Prop({ required: true, index: true }) eventKey: string;
  @Prop({ type: String, enum: NotificationChannel, required: true, index: true }) channel: NotificationChannel;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) userId: string | null;
  @Prop({ type: String, default: null, index: true }) webhookEndpointId: string | null;
  @Prop({ default: true, index: true }) enabled: boolean;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ default: false, index: true }) isDeleted: boolean;
}

@Schema({ collection: 'notification_webhook_endpoints', timestamps: true, versionKey: 'version' })
export class NotificationWebhookEndpoint {
  @Prop({ required: true, unique: true, index: true }) webhookEndpointId: string;
  @Prop({ required: true, index: true }) workspaceId: string;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) url: string;
  @Prop({ required: true, select: false }) secretHash: string;
  @Prop({ default: true, index: true }) enabled: boolean;
  @Prop({ type: [String], default: [] }) eventKeys: string[];
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ default: false, index: true }) isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationDeliverySchema = SchemaFactory.createForClass(NotificationDelivery);
export const NotificationPreferenceSchema = SchemaFactory.createForClass(NotificationPreference);
export const NotificationSubscriptionSchema = SchemaFactory.createForClass(NotificationSubscription);
export const NotificationWebhookEndpointSchema = SchemaFactory.createForClass(NotificationWebhookEndpoint);

NotificationSchema.index({ recipientUserId: 1, status: 1, createdAt: -1, isDeleted: 1 });
NotificationSchema.index({ workspaceId: 1, createdAt: -1, isDeleted: 1 });
NotificationSchema.index({ eventKey: 1, deduplicationKey: 1, recipientUserId: 1 }, { unique: true });
NotificationDeliverySchema.index({ status: 1, scheduledAt: 1, isDeleted: 1 });
NotificationDeliverySchema.index({ notificationId: 1, channel: 1, idempotencyKey: 1 }, { unique: true });
NotificationPreferenceSchema.index({ scope: 1, userId: 1, workspaceId: 1, eventKey: 1, category: 1, isDeleted: 1 });
NotificationSubscriptionSchema.index({ workspaceId: 1, eventKey: 1, channel: 1, isDeleted: 1 });
NotificationWebhookEndpointSchema.index({ workspaceId: 1, enabled: 1, isDeleted: 1 });

for (const schema of [NotificationSchema, NotificationDeliverySchema, NotificationPreferenceSchema, NotificationSubscriptionSchema, NotificationWebhookEndpointSchema]) {
  schema.pre(/^find/, function (this: Query<unknown, unknown>, next) {
    if (this.getFilter().isDeleted === undefined) this.where({ isDeleted: false });
    next();
  });
}
