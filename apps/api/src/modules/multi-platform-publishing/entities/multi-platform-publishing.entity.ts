import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublishingScope } from '../../publishing-workflow/entities/publishing-workflow.entity';

export enum MultiPlatformExecutionStrategy { PARALLEL = 'PARALLEL', SEQUENTIAL = 'SEQUENTIAL', PRIORITY_ORDERED = 'PRIORITY_ORDERED', DEPENDENCY_AWARE = 'DEPENDENCY_AWARE' }
export enum MultiPlatformOrchestrationStatus { DRAFT = 'DRAFT', PENDING_VALIDATION = 'PENDING_VALIDATION', VALIDATING = 'VALIDATING', READY = 'READY', QUEUED = 'QUEUED', PROCESSING = 'PROCESSING', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', COMPLETED = 'COMPLETED', RETRY_PENDING = 'RETRY_PENDING', BLOCKED = 'BLOCKED', CANCEL_REQUESTED = 'CANCEL_REQUESTED', CANCELLED = 'CANCELLED', FAILED = 'FAILED', SUPERSEDED = 'SUPERSEDED' }
export enum MultiPlatformTargetStatus { PENDING = 'PENDING', BLOCKED = 'BLOCKED', READY = 'READY', QUEUED = 'QUEUED', PROCESSING = 'PROCESSING', READY_FOR_MANUAL_SUBMISSION = 'READY_FOR_MANUAL_SUBMISSION', SUBMITTED = 'SUBMITTED', PUBLISHED = 'PUBLISHED', ACTION_REQUIRED = 'ACTION_REQUIRED', REJECTED = 'REJECTED', FAILED = 'FAILED', RETRY_PENDING = 'RETRY_PENDING', CANCELLED = 'CANCELLED', SKIPPED = 'SKIPPED' }
export enum MultiPlatformConflictPolicy { BLOCK = 'BLOCK', WARN = 'WARN', PREFER_DIRECT = 'PREFER_DIRECT', PREFER_DISTRIBUTOR = 'PREFER_DISTRIBUTOR', REQUIRE_MANUAL_DECISION = 'REQUIRE_MANUAL_DECISION', ALLOW_WITH_CONFIRMATION = 'ALLOW_WITH_CONFIRMATION' }
export enum MultiPlatformPartialSuccessPolicy { FAIL_ALL = 'FAIL_ALL', ALLOW_PARTIAL = 'ALLOW_PARTIAL', REQUIRE_ALL_REQUIRED_TARGETS = 'REQUIRE_ALL_REQUIRED_TARGETS', CONTINUE_OPTIONAL_TARGETS = 'CONTINUE_OPTIONAL_TARGETS', REQUIRE_MANUAL_DECISION = 'REQUIRE_MANUAL_DECISION' }
export enum MultiPlatformFailurePolicy { STOP_IMMEDIATELY = 'STOP_IMMEDIATELY', CONTINUE_INDEPENDENT_TARGETS = 'CONTINUE_INDEPENDENT_TARGETS', CONTINUE_OPTIONAL_TARGETS = 'CONTINUE_OPTIONAL_TARGETS', CANCEL_PENDING_TARGETS = 'CANCEL_PENDING_TARGETS', REQUIRE_MANUAL_DECISION = 'REQUIRE_MANUAL_DECISION' }
export enum MultiPlatformEventType { ORCHESTRATION_CREATED = 'ORCHESTRATION_CREATED', VALIDATION_STARTED = 'VALIDATION_STARTED', VALIDATION_COMPLETED = 'VALIDATION_COMPLETED', PROVIDERS_RESOLVED = 'PROVIDERS_RESOLVED', FORMATS_RESOLVED = 'FORMATS_RESOLVED', DEPENDENCIES_RESOLVED = 'DEPENDENCIES_RESOLVED', CONFLICT_DETECTED = 'CONFLICT_DETECTED', CONFLICT_RESOLVED = 'CONFLICT_RESOLVED', ORCHESTRATION_BLOCKED = 'ORCHESTRATION_BLOCKED', ORCHESTRATION_QUEUED = 'ORCHESTRATION_QUEUED', ORCHESTRATION_STARTED = 'ORCHESTRATION_STARTED', TARGET_READY = 'TARGET_READY', TARGET_STARTED = 'TARGET_STARTED', TARGET_PACKAGE_PREPARED = 'TARGET_PACKAGE_PREPARED', TARGET_AWAITING_MANUAL_SUBMISSION = 'TARGET_AWAITING_MANUAL_SUBMISSION', TARGET_SUBMITTED = 'TARGET_SUBMITTED', TARGET_PUBLISHED = 'TARGET_PUBLISHED', TARGET_ACTION_REQUIRED = 'TARGET_ACTION_REQUIRED', TARGET_FAILED = 'TARGET_FAILED', RETRY_SCHEDULED = 'RETRY_SCHEDULED', ORCHESTRATION_PARTIALLY_COMPLETED = 'ORCHESTRATION_PARTIALLY_COMPLETED', ORCHESTRATION_COMPLETED = 'ORCHESTRATION_COMPLETED', CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED', ORCHESTRATION_CANCELLED = 'ORCHESTRATION_CANCELLED', ORCHESTRATION_RESUMED = 'ORCHESTRATION_RESUMED', ORCHESTRATION_FAILED = 'ORCHESTRATION_FAILED' }

export type MultiPlatformPublishingOrchestrationDocument = HydratedDocument<MultiPlatformPublishingOrchestration>;

@Schema({ collection: 'multi_platform_publishing_orchestrations', timestamps: true, versionKey: 'version' })
export class MultiPlatformPublishingOrchestration {
  @Prop({ required: true, unique: true, index: true }) orchestrationId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: PublishingScope, required: true, index: true }) publicationScope: PublishingScope;
  @Prop({ type: [String], required: true, index: true }) providerKeys: string[];
  @Prop({ type: String, enum: MultiPlatformExecutionStrategy, required: true }) executionStrategy: MultiPlatformExecutionStrategy;
  @Prop({ required: true }) policyProfile: string;
  @Prop({ required: true, index: true }) policyVersion: string;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ required: true, index: true }) orchestrationFingerprint: string;
  @Prop({ type: String, enum: MultiPlatformOrchestrationStatus, required: true, index: true }) status: MultiPlatformOrchestrationStatus;
  @Prop({ type: Object, default: {} }) normalizedMetadataReference: Record<string, unknown>;
  @Prop({ type: String, default: null }) publicationReadinessResultId: string | null;
  @Prop({ type: Object, default: {} }) sourceResultIds: Record<string, string>;
  @Prop({ type: Object, default: {} }) sourceResultVersions: Record<string, string>;
  @Prop({ type: [String], default: [] }) providerTargetIds: string[];
  @Prop({ type: [String], default: [] }) requiredProviderKeys: string[];
  @Prop({ type: [String], default: [] }) optionalProviderKeys: string[];
  @Prop({ type: Object, default: {} }) dependencyGraph: Record<string, string[]>;
  @Prop({ type: [Object], default: [] }) conflicts: Record<string, unknown>[];
  @Prop({ type: Object, default: {} }) conflictResolution: Record<string, unknown>;
  @Prop({ type: [String], default: [] }) blockedReasons: string[];
  @Prop({ type: String, default: null }) currentExecutionStage: string | null;
  @Prop({ type: Date, default: null }) scheduledAt: Date | null;
  @Prop({ type: Date, default: null }) queuedAt: Date | null;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: String, default: null }) cancellationReason: string | null;
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
  @Prop({ type: Object, default: null }) lastError: Record<string, unknown> | null;
  @Prop({ required: true }) requestedBy: string;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const MultiPlatformPublishingOrchestrationSchema = SchemaFactory.createForClass(MultiPlatformPublishingOrchestration);
MultiPlatformPublishingOrchestrationSchema.index({ projectId: 1, manuscriptVersion: 1, createdAt: -1 });
MultiPlatformPublishingOrchestrationSchema.index({ projectId: 1, status: 1, isDeleted: 1 });
MultiPlatformPublishingOrchestrationSchema.index({ scheduledAt: 1, nextRetryAt: 1 });
MultiPlatformPublishingOrchestrationSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
