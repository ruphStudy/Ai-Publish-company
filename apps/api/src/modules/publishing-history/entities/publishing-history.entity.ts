import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PublishingHistorySource { WORKFLOW = 'WORKFLOW', ORCHESTRATION = 'ORCHESTRATION', PROVIDER_ADAPTER = 'PROVIDER_ADAPTER', STATUS_SYNC_ENGINE = 'STATUS_SYNC_ENGINE', MANUAL_UPDATE = 'MANUAL_UPDATE', SCHEDULER = 'SCHEDULER', QUEUE_WORKER = 'QUEUE_WORKER', ADMINISTRATOR = 'ADMINISTRATOR', SYSTEM = 'SYSTEM', API = 'API', RECONCILIATION = 'RECONCILIATION', FUTURE_PROVIDER = 'FUTURE_PROVIDER' }
export enum PublishingHistoryEventType { WORKFLOW_CREATED = 'WORKFLOW_CREATED', WORKFLOW_VALIDATED = 'WORKFLOW_VALIDATED', WORKFLOW_STARTED = 'WORKFLOW_STARTED', WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED', WORKFLOW_FAILED = 'WORKFLOW_FAILED', WORKFLOW_CANCELLED = 'WORKFLOW_CANCELLED', WORKFLOW_RESUMED = 'WORKFLOW_RESUMED', PACKAGE_PREPARED = 'PACKAGE_PREPARED', TARGET_CREATED = 'TARGET_CREATED', TARGET_READY = 'TARGET_READY', TARGET_SUBMITTED = 'TARGET_SUBMITTED', TARGET_PUBLISHED = 'TARGET_PUBLISHED', TARGET_REJECTED = 'TARGET_REJECTED', TARGET_FAILED = 'TARGET_FAILED', TARGET_CANCELLED = 'TARGET_CANCELLED', TARGET_RETRIED = 'TARGET_RETRIED', STATUS_UPDATED = 'STATUS_UPDATED', STATUS_SYNCED = 'STATUS_SYNCED', CONFLICT_DETECTED = 'CONFLICT_DETECTED', CONFLICT_RESOLVED = 'CONFLICT_RESOLVED', MANUAL_SUBMISSION = 'MANUAL_SUBMISSION', MANUAL_STATUS_UPDATE = 'MANUAL_STATUS_UPDATE', PROVIDER_RESPONSE = 'PROVIDER_RESPONSE', RECONCILIATION = 'RECONCILIATION', SYSTEM_EVENT = 'SYSTEM_EVENT', SECURITY_EVENT = 'SECURITY_EVENT', AUDIT_EVENT = 'AUDIT_EVENT' }
export enum PublishingHistoryCategory { WORKFLOW = 'WORKFLOW', TARGET = 'TARGET', PROVIDER = 'PROVIDER', STATUS = 'STATUS', SECURITY = 'SECURITY', MANUAL = 'MANUAL', SYSTEM = 'SYSTEM', RECONCILIATION = 'RECONCILIATION', AUDIT = 'AUDIT' }
export enum PublishingActorType { USER = 'USER', ADMIN = 'ADMIN', SYSTEM = 'SYSTEM', PROVIDER = 'PROVIDER', WORKER = 'WORKER' }

export type PublishingHistoryDocument = HydratedDocument<PublishingHistory>;

@Schema({ collection: 'publishing_history_records', timestamps: true, versionKey: 'version' })
export class PublishingHistory {
  @Prop({ required: true, unique: true, index: true }) eventId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, default: null, index: true }) workflowId: string | null;
  @Prop({ type: String, default: null, index: true }) orchestrationId: string | null;
  @Prop({ type: String, default: null, index: true }) targetExecutionId: string | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: String, enum: PublishingHistoryEventType, required: true, index: true }) eventType: PublishingHistoryEventType;
  @Prop({ type: String, enum: PublishingHistoryCategory, required: true, index: true }) category: PublishingHistoryCategory;
  @Prop({ type: String, default: null, index: true }) status: string | null;
  @Prop({ type: String, default: null }) previousStatus: string | null;
  @Prop({ type: String, default: null, index: true }) actor: string | null;
  @Prop({ type: String, enum: PublishingActorType, required: true, index: true }) actorType: PublishingActorType;
  @Prop({ type: String, enum: PublishingHistorySource, required: true, index: true }) source: PublishingHistorySource;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: String, required: true }) message: string;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, default: null, index: true }) externalReference: string | null;
  @Prop({ type: Date, required: true, index: true }) timestamp: Date;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const PublishingHistorySchema = SchemaFactory.createForClass(PublishingHistory);
PublishingHistorySchema.index({ projectId: 1, timestamp: -1 });
PublishingHistorySchema.index({ workflowId: 1, timestamp: -1 });
PublishingHistorySchema.index({ orchestrationId: 1, timestamp: -1 });
PublishingHistorySchema.index({ targetExecutionId: 1, timestamp: -1 });
PublishingHistorySchema.index({ providerKey: 1, timestamp: -1 });
PublishingHistorySchema.index({ eventType: 1, category: 1, timestamp: -1 });
PublishingHistorySchema.index({ correlationId: 1, timestamp: -1 });
