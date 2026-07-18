import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PublicationStatusSource { PROVIDER_API = 'PROVIDER_API', MANUAL_UPDATE = 'MANUAL_UPDATE', PROVIDER_WEBHOOK = 'PROVIDER_WEBHOOK', SCHEDULED_POLL = 'SCHEDULED_POLL', WORKFLOW_EVENT = 'WORKFLOW_EVENT', ORCHESTRATION_EVENT = 'ORCHESTRATION_EVENT', ADMIN_CORRECTION = 'ADMIN_CORRECTION', SYSTEM_RECONCILIATION = 'SYSTEM_RECONCILIATION' }
export enum NormalizedPublicationStatus { DRAFT = 'DRAFT', READY_FOR_SUBMISSION = 'READY_FOR_SUBMISSION', AWAITING_MANUAL_SUBMISSION = 'AWAITING_MANUAL_SUBMISSION', SUBMITTED = 'SUBMITTED', PROCESSING = 'PROCESSING', IN_REVIEW = 'IN_REVIEW', ACTION_REQUIRED = 'ACTION_REQUIRED', APPROVED = 'APPROVED', PUBLISHING = 'PUBLISHING', LIVE = 'LIVE', PARTIALLY_LIVE = 'PARTIALLY_LIVE', BLOCKED = 'BLOCKED', REJECTED = 'REJECTED', FAILED = 'FAILED', UNPUBLISHED = 'UNPUBLISHED', REMOVED = 'REMOVED', CANCELLED = 'CANCELLED', UNKNOWN = 'UNKNOWN' }
export enum ProviderSyncStatus { NOT_CONFIGURED = 'NOT_CONFIGURED', IDLE = 'IDLE', QUEUED = 'QUEUED', SYNCING = 'SYNCING', SYNCHRONIZED = 'SYNCHRONIZED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', PAUSED = 'PAUSED', DISABLED = 'DISABLED', MANUAL_ONLY = 'MANUAL_ONLY' }
export enum PublicationSyncTriggerType { MANUAL = 'MANUAL', SCHEDULED = 'SCHEDULED', EVENT_DRIVEN = 'EVENT_DRIVEN', RETRY = 'RETRY', RECONCILIATION = 'RECONCILIATION', ADMIN = 'ADMIN' }
export enum PublicationSyncMode { SINGLE_TARGET = 'SINGLE_TARGET', SINGLE_WORKFLOW = 'SINGLE_WORKFLOW', SINGLE_ORCHESTRATION = 'SINGLE_ORCHESTRATION', PROJECT = 'PROJECT', PROVIDER = 'PROVIDER', BATCH = 'BATCH' }
export enum PublicationStatusConflictPolicy { PROVIDER_WINS = 'PROVIDER_WINS', MANUAL_WINS = 'MANUAL_WINS', LATEST_TIMESTAMP_WINS = 'LATEST_TIMESTAMP_WINS', HIGHEST_PRECEDENCE_SOURCE_WINS = 'HIGHEST_PRECEDENCE_SOURCE_WINS', REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW', RECORD_ONLY = 'RECORD_ONLY', BLOCK_SYNC = 'BLOCK_SYNC' }
export enum PublicationStatusEventType { STATUS_SYNC_REQUESTED = 'STATUS_SYNC_REQUESTED', STATUS_SYNC_STARTED = 'STATUS_SYNC_STARTED', PROVIDER_STATUS_FETCHED = 'PROVIDER_STATUS_FETCHED', PROVIDER_STATUS_NORMALIZED = 'PROVIDER_STATUS_NORMALIZED', STATUS_UPDATE_SKIPPED_DUPLICATE = 'STATUS_UPDATE_SKIPPED_DUPLICATE', STALE_STATUS_DETECTED = 'STALE_STATUS_DETECTED', STATUS_CONFLICT_DETECTED = 'STATUS_CONFLICT_DETECTED', STATUS_CONFLICT_RESOLVED = 'STATUS_CONFLICT_RESOLVED', TARGET_STATUS_UPDATED = 'TARGET_STATUS_UPDATED', TARGET_ACTION_REQUIRED = 'TARGET_ACTION_REQUIRED', TARGET_PUBLISHED = 'TARGET_PUBLISHED', TARGET_REJECTED = 'TARGET_REJECTED', TARGET_UNPUBLISHED = 'TARGET_UNPUBLISHED', TARGET_REMOVED = 'TARGET_REMOVED', WORKFLOW_STATUS_RECALCULATED = 'WORKFLOW_STATUS_RECALCULATED', ORCHESTRATION_STATUS_RECALCULATED = 'ORCHESTRATION_STATUS_RECALCULATED', STATUS_SYNC_RETRY_SCHEDULED = 'STATUS_SYNC_RETRY_SCHEDULED', STATUS_SYNC_COMPLETED = 'STATUS_SYNC_COMPLETED', STATUS_SYNC_FAILED = 'STATUS_SYNC_FAILED', STATUS_SYNC_PAUSED = 'STATUS_SYNC_PAUSED', STATUS_RECONCILIATION_COMPLETED = 'STATUS_RECONCILIATION_COMPLETED' }
export enum PublicationPollingStrategy { NONE = 'NONE', FIXED = 'FIXED', EXPONENTIAL = 'EXPONENTIAL', PROVIDER_DIRECTED = 'PROVIDER_DIRECTED' }

export type PublicationStatusSyncDocument = HydratedDocument<PublicationStatusSync>;

@Schema({ collection: 'publication_status_sync_operations', timestamps: true, versionKey: 'version' })
export class PublicationStatusSync {
  @Prop({ required: true, unique: true, index: true }) syncOperationId: string;
  @Prop({ required: true, index: true }) targetExecutionId: string;
  @Prop({ type: String, default: null, index: true }) workflowId: string | null;
  @Prop({ type: String, default: null, index: true }) orchestrationId: string | null;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ type: String, enum: PublicationSyncTriggerType, required: true }) triggerType: PublicationSyncTriggerType;
  @Prop({ type: String, enum: PublicationSyncMode, required: true, index: true }) syncMode: PublicationSyncMode;
  @Prop({ type: String, enum: ProviderSyncStatus, required: true, index: true }) syncStatus: ProviderSyncStatus;
  @Prop({ type: String, enum: PublicationStatusSource, required: true, index: true }) source: PublicationStatusSource;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ required: true, index: true }) lockKey: string;
  @Prop({ default: 1, min: 1 }) attempt: number;
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null, index: true }) nextRetryAt: Date | null;
  @Prop({ type: Date, default: null }) providerRetryAfter: Date | null;
  @Prop({ type: String, enum: NormalizedPublicationStatus, default: null }) previousNormalizedStatus: NormalizedPublicationStatus | null;
  @Prop({ type: String, enum: NormalizedPublicationStatus, default: null }) fetchedNormalizedStatus: NormalizedPublicationStatus | null;
  @Prop({ type: String, enum: NormalizedPublicationStatus, default: null }) appliedNormalizedStatus: NormalizedPublicationStatus | null;
  @Prop({ type: String, default: null, index: true }) providerResponseFingerprint: string | null;
  @Prop({ type: Date, default: null, index: true }) providerUpdatedAt: Date | null;
  @Prop({ type: Date, default: null }) fetchedAt: Date | null;
  @Prop({ default: false }) stale: boolean;
  @Prop({ default: false }) conflictDetected: boolean;
  @Prop({ type: Object, default: null }) conflictResolution: Record<string, unknown> | null;
  @Prop({ type: Object, default: null }) error: Record<string, unknown> | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const PublicationStatusSyncSchema = SchemaFactory.createForClass(PublicationStatusSync);
PublicationStatusSyncSchema.index({ targetExecutionId: 1, syncStatus: 1, isDeleted: 1 });
PublicationStatusSyncSchema.index({ providerKey: 1, syncStatus: 1, nextRetryAt: 1 });
PublicationStatusSyncSchema.index({ projectId: 1, createdAt: -1, isDeleted: 1 });
PublicationStatusSyncSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
