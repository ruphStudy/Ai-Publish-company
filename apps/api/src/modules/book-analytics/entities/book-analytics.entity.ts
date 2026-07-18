import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum AnalyticsScope { BOOK = 'BOOK', EDITION = 'EDITION', FORMAT = 'FORMAT', AUTHOR = 'AUTHOR', SERIES = 'SERIES', PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', COUNTRY = 'COUNTRY', TERRITORY = 'TERRITORY', PROJECT = 'PROJECT', PORTFOLIO = 'PORTFOLIO' }
export enum AnalyticsMode { ON_DEMAND = 'ON_DEMAND', INCREMENTAL_REFRESH = 'INCREMENTAL_REFRESH', FULL_REBUILD = 'FULL_REBUILD', SCHEDULED_REFRESH = 'SCHEDULED_REFRESH', HISTORICAL_BACKFILL = 'HISTORICAL_BACKFILL', SNAPSHOT_GENERATION = 'SNAPSHOT_GENERATION' }
export enum AnalyticsPeriod { TODAY = 'TODAY', YESTERDAY = 'YESTERDAY', LAST_7_DAYS = 'LAST_7_DAYS', LAST_30_DAYS = 'LAST_30_DAYS', LAST_90_DAYS = 'LAST_90_DAYS', CURRENT_WEEK = 'CURRENT_WEEK', PREVIOUS_WEEK = 'PREVIOUS_WEEK', CURRENT_MONTH = 'CURRENT_MONTH', PREVIOUS_MONTH = 'PREVIOUS_MONTH', CURRENT_QUARTER = 'CURRENT_QUARTER', PREVIOUS_QUARTER = 'PREVIOUS_QUARTER', CURRENT_YEAR = 'CURRENT_YEAR', PREVIOUS_YEAR = 'PREVIOUS_YEAR', LIFETIME = 'LIFETIME', CUSTOM = 'CUSTOM' }
export enum AnalyticsStatus { PENDING = 'PENDING', QUEUED = 'QUEUED', CALCULATING = 'CALCULATING', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', COMPLETED = 'COMPLETED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED', SUPERSEDED = 'SUPERSEDED' }
export enum AnalyticsSnapshotType { CURRENT = 'CURRENT', DAILY = 'DAILY', WEEKLY = 'WEEKLY', MONTHLY = 'MONTHLY', QUARTERLY = 'QUARTERLY', YEARLY = 'YEARLY', LIFETIME = 'LIFETIME', CUSTOM = 'CUSTOM' }
export enum AnalyticsGranularity { DAY = 'DAY', WEEK = 'WEEK', MONTH = 'MONTH', QUARTER = 'QUARTER', YEAR = 'YEAR' }
export enum AnalyticsEventType { ANALYTICS_REQUESTED = 'ANALYTICS_REQUESTED', ANALYTICS_REFRESH_QUEUED = 'ANALYTICS_REFRESH_QUEUED', ANALYTICS_REFRESH_STARTED = 'ANALYTICS_REFRESH_STARTED', ANALYTICS_SCOPE_RESOLVED = 'ANALYTICS_SCOPE_RESOLVED', ANALYTICS_DATA_LOADED = 'ANALYTICS_DATA_LOADED', ANALYTICS_METRICS_CALCULATED = 'ANALYTICS_METRICS_CALCULATED', ANALYTICS_COMPARISONS_CALCULATED = 'ANALYTICS_COMPARISONS_CALCULATED', ANALYTICS_TRENDS_CALCULATED = 'ANALYTICS_TRENDS_CALCULATED', ANALYTICS_SNAPSHOT_CREATED = 'ANALYTICS_SNAPSHOT_CREATED', ANALYTICS_SNAPSHOT_SUPERSEDED = 'ANALYTICS_SNAPSHOT_SUPERSEDED', ANALYTICS_PARTIALLY_COMPLETED = 'ANALYTICS_PARTIALLY_COMPLETED', ANALYTICS_REFRESH_COMPLETED = 'ANALYTICS_REFRESH_COMPLETED', ANALYTICS_REFRESH_FAILED = 'ANALYTICS_REFRESH_FAILED', ANALYTICS_REFRESH_RETRY_SCHEDULED = 'ANALYTICS_REFRESH_RETRY_SCHEDULED', ANALYTICS_REFRESH_CANCELLED = 'ANALYTICS_REFRESH_CANCELLED' }

export type AnalyticsSnapshotDocument = HydratedDocument<AnalyticsSnapshot>;

@Schema({ collection: 'analytics_snapshots', timestamps: true, versionKey: 'version' })
export class AnalyticsSnapshot {
  @Prop({ required: true, unique: true, index: true }) snapshotId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: AnalyticsScope, required: true, index: true }) scope: AnalyticsScope;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: String, required: true, index: true }) entityType: string;
  @Prop({ type: String, enum: AnalyticsSnapshotType, required: true, index: true }) periodType: AnalyticsSnapshotType;
  @Prop({ type: Date, required: true, index: true }) periodStart: Date;
  @Prop({ type: Date, required: true, index: true }) periodEnd: Date;
  @Prop({ type: Date, default: null }) comparisonPeriodStart: Date | null;
  @Prop({ type: Date, default: null }) comparisonPeriodEnd: Date | null;
  @Prop({ required: true, index: true }) reportingCurrency: string;
  @Prop({ type: Object, default: {} }) metricValues: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) comparisonValues: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) trends: Record<string, unknown>[];
  @Prop({ type: Object, default: {} }) dimensionBreakdowns: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) dataCompleteness: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) sourceCheckpoint: Record<string, unknown>;
  @Prop({ required: true, index: true }) analyticsPolicyVersion: string;
  @Prop({ type: [String], default: [] }) normalizationProfileVersions: string[];
  @Prop({ type: Date, required: true, index: true }) generatedAt: Date;
  @Prop({ type: Date, default: null }) validUntil: Date | null;
  @Prop({ type: String, enum: AnalyticsStatus, required: true, index: true }) status: AnalyticsStatus;
  @Prop({ type: String, default: null }) supersedesSnapshotId: string | null;
  @Prop({ type: String, default: null }) supersededBySnapshotId: string | null;
  @Prop({ required: true, unique: true, index: true }) fingerprint: string;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const AnalyticsSnapshotSchema = SchemaFactory.createForClass(AnalyticsSnapshot);
AnalyticsSnapshotSchema.index({ projectId: 1, scope: 1, entityId: 1, periodType: 1, reportingCurrency: 1 });
AnalyticsSnapshotSchema.index({ periodStart: 1, periodEnd: 1, status: 1 });
AnalyticsSnapshotSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

export type AnalyticsRefreshDocument = HydratedDocument<AnalyticsRefresh>;

@Schema({ collection: 'analytics_refreshes', timestamps: true, versionKey: 'version' })
export class AnalyticsRefresh {
  @Prop({ required: true, unique: true, index: true }) refreshId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: AnalyticsScope, required: true, index: true }) scope: AnalyticsScope;
  @Prop({ type: [String], default: [], index: true }) entityIds: string[];
  @Prop({ type: String, enum: AnalyticsMode, required: true, index: true }) mode: AnalyticsMode;
  @Prop({ type: String, enum: AnalyticsStatus, required: true, index: true }) status: AnalyticsStatus;
  @Prop({ type: Object, required: true }) period: Record<string, unknown>;
  @Prop({ type: Object, default: null }) comparisonPeriod: Record<string, unknown> | null;
  @Prop({ required: true }) reportingCurrency: string;
  @Prop({ required: true, index: true }) analyticsPolicyVersion: string;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ type: Object, default: {} }) sourceCheckpointStart: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) sourceCheckpointEnd: Record<string, unknown>;
  @Prop({ default: 0, min: 0 }) recordsProcessed: number;
  @Prop({ default: 0, min: 0 }) snapshotsCreated: number;
  @Prop({ default: 0, min: 0 }) snapshotsUpdated: number;
  @Prop({ default: 0, min: 0 }) snapshotsSuperseded: number;
  @Prop({ default: 0, min: 0 }) warningCount: number;
  @Prop({ default: 0, min: 0 }) errorCount: number;
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: String, default: null }) rebuildReason: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const AnalyticsRefreshSchema = SchemaFactory.createForClass(AnalyticsRefresh);
AnalyticsRefreshSchema.index({ projectId: 1, scope: 1, status: 1, isDeleted: 1 });
AnalyticsRefreshSchema.index({ mode: 1, status: 1, startedAt: -1 });
AnalyticsRefreshSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
