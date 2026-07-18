import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum InsightScope { BOOK = 'BOOK', EDITION = 'EDITION', AUTHOR = 'AUTHOR', SERIES = 'SERIES', PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', COUNTRY = 'COUNTRY', FORMAT = 'FORMAT', PROJECT = 'PROJECT', PORTFOLIO = 'PORTFOLIO' }
export enum InsightCategory { EXECUTIVE_SUMMARY = 'EXECUTIVE_SUMMARY', SALES = 'SALES', REVENUE = 'REVENUE', ROYALTY = 'ROYALTY', GROWTH = 'GROWTH', DECLINE = 'DECLINE', OPPORTUNITY = 'OPPORTUNITY', RISK = 'RISK', PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', COUNTRY = 'COUNTRY', FORMAT = 'FORMAT', BOOK = 'BOOK', EDITION = 'EDITION', AUTHOR = 'AUTHOR', SERIES = 'SERIES', PORTFOLIO = 'PORTFOLIO', PRICING = 'PRICING', METADATA = 'METADATA', CATEGORY = 'CATEGORY', KEYWORD = 'KEYWORD', PUBLICATION = 'PUBLICATION', DATA_QUALITY = 'DATA_QUALITY', DATA_FRESHNESS = 'DATA_FRESHNESS', PERFORMANCE = 'PERFORMANCE', CUSTOM = 'CUSTOM' }
export enum InsightType { TREND = 'TREND', EXPLANATION = 'EXPLANATION', RECOMMENDATION = 'RECOMMENDATION', WARNING = 'WARNING', ALERT = 'ALERT', SUCCESS = 'SUCCESS', SUMMARY = 'SUMMARY', COMPARISON = 'COMPARISON', ANOMALY = 'ANOMALY', FORECAST_READY = 'FORECAST_READY', ACTIONABLE = 'ACTIONABLE', INFORMATIONAL = 'INFORMATIONAL' }
export enum InsightStatus { GENERATED = 'GENERATED', ACTIVE = 'ACTIVE', ACKNOWLEDGED = 'ACKNOWLEDGED', DISMISSED = 'DISMISSED', ARCHIVED = 'ARCHIVED', SUPERSEDED = 'SUPERSEDED', EXPIRED = 'EXPIRED' }
export enum InsightPriority { CRITICAL = 'CRITICAL', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW', INFORMATIONAL = 'INFORMATIONAL' }
export enum InsightRefreshStatus { PENDING = 'PENDING', QUEUED = 'QUEUED', GENERATING = 'GENERATING', COMPLETED = 'COMPLETED', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED' }
export enum InsightRefreshMode { INCREMENTAL_REFRESH = 'INCREMENTAL_REFRESH', SCHEDULED_REFRESH = 'SCHEDULED_REFRESH', MANUAL_REFRESH = 'MANUAL_REFRESH', FULL_REBUILD = 'FULL_REBUILD' }
export enum InsightEventType { INSIGHT_REQUESTED = 'INSIGHT_REQUESTED', INSIGHT_STARTED = 'INSIGHT_STARTED', INSIGHT_GENERATED = 'INSIGHT_GENERATED', INSIGHT_VALIDATED = 'INSIGHT_VALIDATED', INSIGHT_COMPLETED = 'INSIGHT_COMPLETED', INSIGHT_FAILED = 'INSIGHT_FAILED', INSIGHT_REFRESH_STARTED = 'INSIGHT_REFRESH_STARTED', INSIGHT_REFRESH_COMPLETED = 'INSIGHT_REFRESH_COMPLETED', INSIGHT_REFRESH_FAILED = 'INSIGHT_REFRESH_FAILED', EXECUTIVE_SUMMARY_GENERATED = 'EXECUTIVE_SUMMARY_GENERATED' }

export type AIInsightDocument = HydratedDocument<AIInsight>;

@Schema({ collection: 'ai_insights', timestamps: true, versionKey: 'version' })
export class AIInsight {
  @Prop({ required: true, unique: true, index: true }) insightId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: InsightScope, required: true, index: true }) scope: InsightScope;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: String, enum: InsightCategory, required: true, index: true }) category: InsightCategory;
  @Prop({ type: String, enum: InsightType, required: true, index: true }) type: InsightType;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) summary: string;
  @Prop({ required: true }) explanation: string;
  @Prop({ type: Object, default: null }) recommendation: Record<string, unknown> | null;
  @Prop({ required: true, min: 0, max: 100 }) confidence: number;
  @Prop({ type: String, enum: InsightPriority, required: true, index: true }) priority: InsightPriority;
  @Prop({ type: Object, default: null }) impact: Record<string, unknown> | null;
  @Prop({ type: [Object], default: [] }) evidence: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) affectedEntities: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) suggestedActions: Record<string, unknown>[];
  @Prop({ type: Object, default: {} }) supportingMetrics: Record<string, unknown>;
  @Prop({ type: [String], default: [] }) supportingOpportunities: string[];
  @Prop({ type: [String], default: [] }) supportingAnalytics: string[];
  @Prop({ required: true, index: true }) promptVersion: string;
  @Prop({ required: true, index: true }) aiProvider: string;
  @Prop({ required: true, index: true }) model: string;
  @Prop({ type: Date, required: true, index: true }) generatedAt: Date;
  @Prop({ type: String, enum: InsightStatus, required: true, index: true }) status: InsightStatus;
  @Prop({ required: true, unique: true, index: true }) fingerprint: string;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const AIInsightSchema = SchemaFactory.createForClass(AIInsight);
AIInsightSchema.index({ projectId: 1, scope: 1, category: 1, status: 1, isDeleted: 1 });
AIInsightSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
