import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PublishingScope { EBOOK = 'EBOOK', PRINT = 'PRINT', BOTH = 'BOTH' }
export enum PublishingTargetType { PLATFORM = 'PLATFORM', DISTRIBUTOR = 'DISTRIBUTOR', DIRECT_EXPORT = 'DIRECT_EXPORT' }
export enum PublishingWorkflowStatus { DRAFT = 'DRAFT', PENDING_VALIDATION = 'PENDING_VALIDATION', VALIDATING = 'VALIDATING', READY = 'READY', QUEUED = 'QUEUED', PROCESSING = 'PROCESSING', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', COMPLETED = 'COMPLETED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCEL_REQUESTED = 'CANCEL_REQUESTED', CANCELLED = 'CANCELLED', BLOCKED = 'BLOCKED', SUPERSEDED = 'SUPERSEDED' }
export enum PublishingTargetStatus { PENDING = 'PENDING', VALIDATING = 'VALIDATING', READY = 'READY', QUEUED = 'QUEUED', SUBMITTING = 'SUBMITTING', SUBMITTED = 'SUBMITTED', PROCESSING = 'PROCESSING', PUBLISHED = 'PUBLISHED', REJECTED = 'REJECTED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED', SKIPPED = 'SKIPPED' }
export enum PublishingStepType { LOAD_PROJECT = 'LOAD_PROJECT', VALIDATE_READINESS = 'VALIDATE_READINESS', VALIDATE_METADATA = 'VALIDATE_METADATA', VALIDATE_EXPORTS = 'VALIDATE_EXPORTS', VALIDATE_ASSETS = 'VALIDATE_ASSETS', RESOLVE_TARGETS = 'RESOLVE_TARGETS', PREPARE_PACKAGE = 'PREPARE_PACKAGE', QUEUE_SUBMISSION = 'QUEUE_SUBMISSION', SUBMIT = 'SUBMIT', POLL_STATUS = 'POLL_STATUS', PROCESS_RESPONSE = 'PROCESS_RESPONSE', COMPLETE = 'COMPLETE', ROLLBACK = 'ROLLBACK', CANCEL = 'CANCEL' }
export enum PublishingStepStatus { PENDING = 'PENDING', RUNNING = 'RUNNING', COMPLETED = 'COMPLETED', SKIPPED = 'SKIPPED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED' }
export enum PublishingWorkflowEventType { WORKFLOW_CREATED = 'WORKFLOW_CREATED', VALIDATION_STARTED = 'VALIDATION_STARTED', VALIDATION_COMPLETED = 'VALIDATION_COMPLETED', WORKFLOW_BLOCKED = 'WORKFLOW_BLOCKED', WORKFLOW_QUEUED = 'WORKFLOW_QUEUED', WORKFLOW_STARTED = 'WORKFLOW_STARTED', TARGET_STARTED = 'TARGET_STARTED', PACKAGE_PREPARED = 'PACKAGE_PREPARED', SUBMISSION_STARTED = 'SUBMISSION_STARTED', SUBMISSION_COMPLETED = 'SUBMISSION_COMPLETED', STATUS_UPDATED = 'STATUS_UPDATED', TARGET_PUBLISHED = 'TARGET_PUBLISHED', TARGET_REJECTED = 'TARGET_REJECTED', TARGET_FAILED = 'TARGET_FAILED', RETRY_SCHEDULED = 'RETRY_SCHEDULED', WORKFLOW_PARTIALLY_COMPLETED = 'WORKFLOW_PARTIALLY_COMPLETED', WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED', CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED', WORKFLOW_CANCELLED = 'WORKFLOW_CANCELLED', WORKFLOW_RESUMED = 'WORKFLOW_RESUMED', WORKFLOW_FAILED = 'WORKFLOW_FAILED' }
export enum PublishingCapability { EBOOK = 'EBOOK', PRINT = 'PRINT', EPUB = 'EPUB', PDF_EBOOK = 'PDF_EBOOK', HARDCOVER = 'HARDCOVER', PAPERBACK = 'PAPERBACK', PREORDER = 'PREORDER', TERRITORY_SELECTION = 'TERRITORY_SELECTION', PRICING = 'PRICING', MULTI_CURRENCY = 'MULTI_CURRENCY', DRM = 'DRM', ISBN = 'ISBN', PROVIDER_GENERATED_IDENTIFIER = 'PROVIDER_GENERATED_IDENTIFIER', AUTHOR_PROFILE = 'AUTHOR_PROFILE', CONTRIBUTORS = 'CONTRIBUTORS', SERIES = 'SERIES', CATEGORIES = 'CATEGORIES', SUBJECTS = 'SUBJECTS', KEYWORDS = 'KEYWORDS', PREVIEW_CONFIGURATION = 'PREVIEW_CONFIGURATION', STATUS_MANUAL_UPDATE = 'STATUS_MANUAL_UPDATE', PRINT_OPTIONS = 'PRINT_OPTIONS', PUBLICATION_DATE = 'PUBLICATION_DATE', CANCELLATION = 'CANCELLATION', STATUS_POLLING = 'STATUS_POLLING', METADATA_UPDATE = 'METADATA_UPDATE', FILE_REPLACEMENT = 'FILE_REPLACEMENT' }
export enum PublishingRetryStrategyType { NONE = 'NONE', FIXED = 'FIXED', EXPONENTIAL = 'EXPONENTIAL' }
export enum PublishingPartialFailurePolicy { FAIL_ALL = 'FAIL_ALL', ALLOW_PARTIAL = 'ALLOW_PARTIAL', CONTINUE_REMAINING = 'CONTINUE_REMAINING', REQUIRE_MANUAL_DECISION = 'REQUIRE_MANUAL_DECISION' }

export type PublishingWorkflowDocument = HydratedDocument<PublishingWorkflow>;

@Schema({ collection: 'publishing_workflows', timestamps: true, versionKey: 'version' })
export class PublishingWorkflow {
  @Prop({ type: String, required: true, unique: true, index: true }) workflowId: string;
  @Prop({ type: String, required: true, index: true }) projectId: string;
  @Prop({ type: String, required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: PublishingScope, required: true, index: true }) publicationScope: PublishingScope;
  @Prop({ type: String, required: true, index: true }) policyProfile: string;
  @Prop({ type: String, required: true, index: true }) policyVersion: string;
  @Prop({ type: String, required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ type: String, required: true, index: true }) submissionFingerprint: string;
  @Prop({ type: String, enum: PublishingWorkflowStatus, required: true, index: true }) status: PublishingWorkflowStatus;
  @Prop({ type: [String], default: [] }) targetIds: string[];
  @Prop({ type: Object, default: {} }) sourceResultIds: Record<string, string>;
  @Prop({ type: Object, default: {} }) sourceResultVersions: Record<string, string>;
  @Prop({ type: [String], default: [] }) exportArtifactIds: string[];
  @Prop({ type: String, default: null }) metadataId: string | null;
  @Prop({ type: String, default: null }) tocId: string | null;
  @Prop({ type: [String], default: [] }) coverAssetIds: string[];
  @Prop({ type: String, required: true }) requestedBy: string;
  @Prop({ type: Date, default: null }) scheduledAt: Date | null;
  @Prop({ type: Date, default: null }) queuedAt: Date | null;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: String, default: null }) cancellationReason: string | null;
  @Prop({ type: [String], default: [] }) blockedReasons: string[];
  @Prop({ type: String, enum: PublishingStepType, default: null }) currentStep: PublishingStepType | null;
  @Prop({ type: Number, default: 0, min: 0 }) retryCount: number;
  @Prop({ type: Number, default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
  @Prop({ type: Object, default: null }) lastError: Record<string, unknown> | null;
  @Prop({ type: Boolean, default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const PublishingWorkflowSchema = SchemaFactory.createForClass(PublishingWorkflow);
PublishingWorkflowSchema.index({ projectId: 1, manuscriptVersion: 1, createdAt: -1 });
PublishingWorkflowSchema.index({ projectId: 1, status: 1, isDeleted: 1 });
PublishingWorkflowSchema.index({ scheduledAt: 1, nextRetryAt: 1 });
PublishingWorkflowSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
