import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum JobCategory { PUBLISHING = 'PUBLISHING', METADATA = 'METADATA', IMPORTS = 'IMPORTS', SYNCHRONIZATION = 'SYNCHRONIZATION', SALES_INGESTION = 'SALES_INGESTION', REVENUE_INGESTION = 'REVENUE_INGESTION', ROYALTY_INGESTION = 'ROYALTY_INGESTION', ANALYTICS = 'ANALYTICS', OPPORTUNITIES = 'OPPORTUNITIES', AI_INSIGHTS = 'AI_INSIGHTS', NOTIFICATIONS = 'NOTIFICATIONS', PROVIDER_INTEGRATIONS = 'PROVIDER_INTEGRATIONS', MARKETPLACE_INTEGRATIONS = 'MARKETPLACE_INTEGRATIONS', MAINTENANCE = 'MAINTENANCE', CLEANUP = 'CLEANUP', MONITORING = 'MONITORING', ADMINISTRATION = 'ADMINISTRATION' }
export enum JobExecutionStatus { PENDING = 'PENDING', SCHEDULED = 'SCHEDULED', QUEUED = 'QUEUED', RUNNING = 'RUNNING', PAUSED = 'PAUSED', CANCELLING = 'CANCELLING', CANCELLED = 'CANCELLED', SUCCEEDED = 'SUCCEEDED', FAILED = 'FAILED', RETRYING = 'RETRYING', TIMED_OUT = 'TIMED_OUT', DEAD_LETTERED = 'DEAD_LETTERED', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED' }
export enum JobPriority { LOW = 10, NORMAL = 5, HIGH = 3, CRITICAL = 1 }
export enum JobBackoffPolicy { FIXED = 'FIXED', EXPONENTIAL = 'EXPONENTIAL' }
export enum JobFailureCategory { TRANSIENT = 'TRANSIENT', RATE_LIMITED = 'RATE_LIMITED', TIMEOUT = 'TIMEOUT', AUTHENTICATION = 'AUTHENTICATION', AUTHORIZATION = 'AUTHORIZATION', VALIDATION = 'VALIDATION', CONFLICT = 'CONFLICT', PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE', UNSUPPORTED_CAPABILITY = 'UNSUPPORTED_CAPABILITY', PERMANENT = 'PERMANENT', CANCELLED = 'CANCELLED', UNKNOWN = 'UNKNOWN' }
export enum JobScheduleStatus { ENABLED = 'ENABLED', DISABLED = 'DISABLED', PAUSED = 'PAUSED' }
export enum JobScheduleType { ONCE = 'ONCE', CRON = 'CRON', INTERVAL = 'INTERVAL' }
export enum JobOverlapPolicy { ALLOW = 'ALLOW', SKIP = 'SKIP', QUEUE = 'QUEUE', REPLACE = 'REPLACE', SINGLE_ACTIVE_EXECUTION = 'SINGLE_ACTIVE_EXECUTION' }
export enum JobMisfirePolicy { SKIP_MISSED = 'SKIP_MISSED', RUN_ONCE_IMMEDIATELY = 'RUN_ONCE_IMMEDIATELY', CATCH_UP_LIMITED = 'CATCH_UP_LIMITED' }
export enum JobIdempotencyScope { GLOBAL = 'GLOBAL', TENANT = 'TENANT', WORKSPACE = 'WORKSPACE', ENTITY = 'ENTITY', PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', SCHEDULE_OCCURRENCE = 'SCHEDULE_OCCURRENCE', EXPLICIT_REQUEST_KEY = 'EXPLICIT_REQUEST_KEY' }

export type JobPayload = Record<string, unknown>;

@Schema({ collection: 'job_executions', timestamps: true, versionKey: 'version' })
export class JobExecution extends Document {
  @Prop({ required: true, unique: true, index: true }) executionId: string;
  @Prop({ required: true, index: true }) jobKey: string;
  @Prop({ type: Number, default: 1 }) payloadVersion: number;
  @Prop({ type: String, default: null, index: true }) tenantId: string | null;
  @Prop({ type: String, default: null, index: true }) workspaceId: string | null;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: String, default: null, index: true }) marketplaceKey: string | null;
  @Prop({ type: String, default: null }) entityType: string | null;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ required: true, index: true }) queue: string;
  @Prop({ type: String, enum: JobExecutionStatus, required: true, index: true }) status: JobExecutionStatus;
  @Prop({ type: Number, default: JobPriority.NORMAL, index: true }) priority: JobPriority;
  @Prop({ type: Number, default: 0 }) attemptCount: number;
  @Prop({ type: Number, default: 0 }) maxAttempts: number;
  @Prop({ type: Number, default: 0 }) progress: number;
  @Prop({ type: Date, default: null, index: true }) scheduledAt: Date | null;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Number, default: null }) timeoutMs: number | null;
  @Prop({ type: String, default: null, index: true }) idempotencyKey: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: String, default: null, index: true }) parentExecutionId: string | null;
  @Prop({ type: String, default: null }) scheduleId: string | null;
  @Prop({ type: String, default: null }) workerId: string | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) payload: JobPayload;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) resultSummary: Record<string, unknown>;
  @Prop({ type: String, enum: JobFailureCategory, default: null }) failureCategory: JobFailureCategory | null;
  @Prop({ type: String, default: null }) errorCode: string | null;
  @Prop({ type: String, default: null }) errorMessage: string | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) checkpoint: Record<string, unknown>;
  @Prop({ type: Boolean, default: false, index: true }) deadLetter: boolean;
  @Prop({ type: Boolean, default: false, index: true }) cancellationRequested: boolean;
  @Prop({ type: String, default: null }) cancellationReason: string | null;
  @Prop({ type: Boolean, default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'job_schedules', timestamps: true, versionKey: 'version' })
export class JobSchedule extends Document {
  @Prop({ required: true, unique: true, index: true }) scheduleId: string;
  @Prop({ required: true, index: true }) jobKey: string;
  @Prop({ required: true }) name: string;
  @Prop({ type: String, enum: JobScheduleType, required: true, index: true }) type: JobScheduleType;
  @Prop({ type: String, enum: JobScheduleStatus, default: JobScheduleStatus.ENABLED, index: true }) status: JobScheduleStatus;
  @Prop({ type: String, default: null }) cron: string | null;
  @Prop({ type: Number, default: null }) intervalMs: number | null;
  @Prop({ type: Date, default: null, index: true }) runAt: Date | null;
  @Prop({ type: String, default: 'UTC' }) timezone: string;
  @Prop({ type: String, enum: JobOverlapPolicy, default: JobOverlapPolicy.SKIP }) overlapPolicy: JobOverlapPolicy;
  @Prop({ type: String, enum: JobMisfirePolicy, default: JobMisfirePolicy.SKIP_MISSED }) misfirePolicy: JobMisfirePolicy;
  @Prop({ type: Date, default: null }) startsAt: Date | null;
  @Prop({ type: Date, default: null }) endsAt: Date | null;
  @Prop({ type: Date, default: null, index: true }) nextRunAt: Date | null;
  @Prop({ type: Date, default: null }) lastRunAt: Date | null;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) payload: JobPayload;
  @Prop({ type: String, default: null }) tenantId: string | null;
  @Prop({ type: String, default: null }) workspaceId: string | null;
  @Prop({ type: String, default: null }) providerKey: string | null;
  @Prop({ type: String, default: null }) marketplaceKey: string | null;
  @Prop({ type: Boolean, default: false, index: true }) locked: boolean;
  @Prop({ type: Date, default: null }) lockedAt: Date | null;
  @Prop({ type: Boolean, default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ collection: 'job_idempotency_records', timestamps: true, versionKey: false })
export class JobIdempotencyRecord extends Document {
  @Prop({ required: true, unique: true, index: true }) key: string;
  @Prop({ required: true, index: true }) executionId: string;
  @Prop({ required: true, index: true }) jobKey: string;
  @Prop({ type: Date, required: true, index: true }) expiresAt: Date;
}

export type JobExecutionDocument = JobExecution & Document;
export type JobScheduleDocument = JobSchedule & Document;
export type JobIdempotencyRecordDocument = JobIdempotencyRecord & Document;
export const JobExecutionSchema = SchemaFactory.createForClass(JobExecution);
export const JobScheduleSchema = SchemaFactory.createForClass(JobSchedule);
export const JobIdempotencyRecordSchema = SchemaFactory.createForClass(JobIdempotencyRecord);
JobExecutionSchema.index({ queue: 1, status: 1, createdAt: -1 });
JobExecutionSchema.index({ tenantId: 1, workspaceId: 1, createdAt: -1 });
JobExecutionSchema.index({ jobKey: 1, status: 1, createdAt: -1 });
JobExecutionSchema.index({ scheduledAt: 1, status: 1 });
JobExecutionSchema.index({ idempotencyKey: 1, status: 1 });
JobExecutionSchema.index({ parentExecutionId: 1, createdAt: -1 });
JobExecutionSchema.index({ deadLetter: 1, status: 1, createdAt: -1 });
JobExecutionSchema.index({ status: 1, workerId: 1, updatedAt: -1 });
JobScheduleSchema.index({ jobKey: 1, status: 1, nextRunAt: 1 });
JobScheduleSchema.index({ tenantId: 1, workspaceId: 1, status: 1 });
JobScheduleSchema.index({ locked: 1, nextRunAt: 1 });
JobIdempotencyRecordSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
for (const schema of [JobExecutionSchema, JobScheduleSchema]) schema.pre(/^find/, function (this: Query<unknown, unknown>, next) { if (!this.getOptions()?.includeDeleted) this.where({ isDeleted: { $ne: true } }); next(); });
