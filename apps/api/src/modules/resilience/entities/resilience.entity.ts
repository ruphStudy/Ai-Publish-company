import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum FailureCategory { VALIDATION = 'VALIDATION', AUTHENTICATION = 'AUTHENTICATION', AUTHORIZATION = 'AUTHORIZATION', CONFIGURATION = 'CONFIGURATION', TIMEOUT = 'TIMEOUT', NETWORK = 'NETWORK', RATE_LIMITED = 'RATE_LIMITED', DEPENDENCY_UNAVAILABLE = 'DEPENDENCY_UNAVAILABLE', PROVIDER_FAILURE = 'PROVIDER_FAILURE', MARKETPLACE_FAILURE = 'MARKETPLACE_FAILURE', DATABASE = 'DATABASE', QUEUE = 'QUEUE', STORAGE = 'STORAGE', EXTERNAL_API = 'EXTERNAL_API', CONCURRENCY = 'CONCURRENCY', CONFLICT = 'CONFLICT', RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED', PARTIAL_FAILURE = 'PARTIAL_FAILURE', PERMANENT_FAILURE = 'PERMANENT_FAILURE', UNKNOWN = 'UNKNOWN' }
export enum CircuitState { CLOSED = 'CLOSED', OPEN = 'OPEN', HALF_OPEN = 'HALF_OPEN' }
export enum RecoveryStatus { PENDING = 'PENDING', RETRYING = 'RETRYING', RECOVERING = 'RECOVERING', COMPENSATING = 'COMPENSATING', SUCCEEDED = 'SUCCEEDED', FAILED = 'FAILED', EXHAUSTED = 'EXHAUSTED', MANUAL_REQUIRED = 'MANUAL_REQUIRED', CANCELLED = 'CANCELLED' }
export enum RecoveryEventType { RETRY_STARTED = 'RETRY_STARTED', RETRY_SUCCEEDED = 'RETRY_SUCCEEDED', RETRY_EXHAUSTED = 'RETRY_EXHAUSTED', CIRCUIT_OPENED = 'CIRCUIT_OPENED', CIRCUIT_CLOSED = 'CIRCUIT_CLOSED', RECOVERY_STARTED = 'RECOVERY_STARTED', RECOVERY_COMPLETED = 'RECOVERY_COMPLETED', RECOVERY_FAILED = 'RECOVERY_FAILED', MANUAL_RECOVERY_REQUIRED = 'MANUAL_RECOVERY_REQUIRED', PROVIDER_DEGRADED = 'PROVIDER_DEGRADED', MARKETPLACE_DEGRADED = 'MARKETPLACE_DEGRADED' }
export enum ResilienceIsolationScope { PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', EXTERNAL_API = 'EXTERNAL_API', QUEUE = 'QUEUE', STORAGE = 'STORAGE', SERVICE = 'SERVICE', AI = 'AI', PUBLISHING = 'PUBLISHING', IMPORTS = 'IMPORTS', SYNCHRONIZATION = 'SYNCHRONIZATION', ANALYTICS = 'ANALYTICS', NOTIFICATIONS = 'NOTIFICATIONS' }

@Schema({ collection: 'recovery_states', timestamps: true, versionKey: 'version' })
export class RecoveryState extends Document {
  @Prop({ required: true, unique: true, index: true }) recoveryId: string;
  @Prop({ required: true, index: true }) operationKey: string;
  @Prop({ required: true, index: true }) policyKey: string;
  @Prop({ type: String, enum: FailureCategory, required: true, index: true }) failureCategory: FailureCategory;
  @Prop({ type: String, enum: RecoveryStatus, required: true, index: true }) status: RecoveryStatus;
  @Prop({ type: String, enum: ResilienceIsolationScope, default: null, index: true }) isolationScope: ResilienceIsolationScope | null;
  @Prop({ type: String, default: null, index: true }) tenantId: string | null;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: String, default: null, index: true }) marketplaceKey: string | null;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: Number, default: 0 }) attemptCount: number;
  @Prop({ type: Number, default: 0 }) maxAttempts: number;
  @Prop({ type: String, default: null, index: true }) idempotencyKey: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) checkpoint: Record<string, unknown>;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) safeContext: Record<string, unknown>;
  @Prop({ type: String, default: null }) errorCode: string | null;
  @Prop({ type: String, default: null }) errorMessage: string | null;
  @Prop({ type: Date, default: null, index: true }) nextRetryAt: Date | null;
  @Prop({ type: Date, default: null }) recoveredAt: Date | null;
  @Prop({ type: Boolean, default: false, index: true }) manualRequired: boolean;
  @Prop({ type: Boolean, default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'circuit_states', timestamps: true, versionKey: 'version' })
export class ResilienceCircuitState extends Document {
  @Prop({ required: true, unique: true, index: true }) circuitId: string;
  @Prop({ required: true, index: true }) policyKey: string;
  @Prop({ type: String, enum: ResilienceIsolationScope, required: true, index: true }) isolationScope: ResilienceIsolationScope;
  @Prop({ required: true, index: true }) isolationKey: string;
  @Prop({ type: String, enum: CircuitState, default: CircuitState.CLOSED, index: true }) state: CircuitState;
  @Prop({ type: Number, default: 0 }) failureCount: number;
  @Prop({ type: Number, default: 0 }) successCount: number;
  @Prop({ type: Date, default: null, index: true }) openedAt: Date | null;
  @Prop({ type: Date, default: null }) halfOpenedAt: Date | null;
  @Prop({ type: Date, default: null }) lastFailureAt: Date | null;
  @Prop({ type: Date, default: null }) lastSuccessAt: Date | null;
  @Prop({ type: String, default: null }) lastErrorCode: string | null;
  @Prop({ type: Boolean, default: false, index: true }) manuallyOverridden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'recovery_events', timestamps: true, versionKey: false })
export class RecoveryEvent extends Document {
  @Prop({ required: true, unique: true, index: true }) eventId: string;
  @Prop({ type: String, default: null, index: true }) recoveryId: string | null;
  @Prop({ type: String, default: null, index: true }) circuitId: string | null;
  @Prop({ type: String, enum: RecoveryEventType, required: true, index: true }) type: RecoveryEventType;
  @Prop({ type: String, enum: FailureCategory, default: null, index: true }) failureCategory: FailureCategory | null;
  @Prop({ type: String, default: null, index: true }) tenantId: string | null;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: String, default: null, index: true }) marketplaceKey: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export type RecoveryStateDocument = RecoveryState & Document;
export type ResilienceCircuitStateDocument = ResilienceCircuitState & Document;
export type RecoveryEventDocument = RecoveryEvent & Document;
export const RecoveryStateSchema = SchemaFactory.createForClass(RecoveryState);
export const ResilienceCircuitStateSchema = SchemaFactory.createForClass(ResilienceCircuitState);
export const RecoveryEventSchema = SchemaFactory.createForClass(RecoveryEvent);
RecoveryStateSchema.index({ status: 1, nextRetryAt: 1 });
RecoveryStateSchema.index({ tenantId: 1, workspaceId: 1, createdAt: -1 });
RecoveryStateSchema.index({ providerKey: 1, marketplaceKey: 1, status: 1 });
RecoveryStateSchema.index({ idempotencyKey: 1, status: 1 });
ResilienceCircuitStateSchema.index({ policyKey: 1, isolationScope: 1, isolationKey: 1 }, { unique: true });
RecoveryEventSchema.index({ recoveryId: 1, createdAt: -1 });
RecoveryEventSchema.index({ type: 1, createdAt: -1 });
RecoveryStateSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) { if (!this.getOptions()?.includeDeleted) this.where({ isDeleted: { $ne: true } }); next(); });
