import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum OpportunityScope { BOOK = 'BOOK', EDITION = 'EDITION', FORMAT = 'FORMAT', AUTHOR = 'AUTHOR', SERIES = 'SERIES', PROVIDER = 'PROVIDER', MARKETPLACE = 'MARKETPLACE', COUNTRY = 'COUNTRY', TERRITORY = 'TERRITORY', CATEGORY = 'CATEGORY', KEYWORD = 'KEYWORD', PROJECT = 'PROJECT', PORTFOLIO = 'PORTFOLIO' }
export enum OpportunityCategory { SALES_GROWTH = 'SALES_GROWTH', REVENUE_GROWTH = 'REVENUE_GROWTH', ROYALTY_GROWTH = 'ROYALTY_GROWTH', PERFORMANCE_RECOVERY = 'PERFORMANCE_RECOVERY', PLATFORM_EXPANSION = 'PLATFORM_EXPANSION', MARKETPLACE_EXPANSION = 'MARKETPLACE_EXPANSION', GEOGRAPHIC_EXPANSION = 'GEOGRAPHIC_EXPANSION', FORMAT_EXPANSION = 'FORMAT_EXPANSION', PRICE_OPTIMIZATION = 'PRICE_OPTIMIZATION', CATEGORY_OPTIMIZATION = 'CATEGORY_OPTIMIZATION', KEYWORD_OPTIMIZATION = 'KEYWORD_OPTIMIZATION', METADATA_OPTIMIZATION = 'METADATA_OPTIMIZATION', PUBLICATION_COVERAGE = 'PUBLICATION_COVERAGE', PROVIDER_DIVERSIFICATION = 'PROVIDER_DIVERSIFICATION', MARKETPLACE_DIVERSIFICATION = 'MARKETPLACE_DIVERSIFICATION', ROYALTY_OPTIMIZATION = 'ROYALTY_OPTIMIZATION', REFUND_REDUCTION = 'REFUND_REDUCTION', SERIES_GROWTH = 'SERIES_GROWTH', AUTHOR_PORTFOLIO_GROWTH = 'AUTHOR_PORTFOLIO_GROWTH', DATA_QUALITY = 'DATA_QUALITY', DATA_FRESHNESS = 'DATA_FRESHNESS', RISK_REDUCTION = 'RISK_REDUCTION' }
export enum OpportunityType { HIGH_GROWTH_BOOK = 'HIGH_GROWTH_BOOK', EMERGING_BOOK = 'EMERGING_BOOK', DECLINING_BOOK = 'DECLINING_BOOK', UNDERPERFORMING_BOOK = 'UNDERPERFORMING_BOOK', ZERO_SALES_BOOK = 'ZERO_SALES_BOOK', HIGH_REFUND_BOOK = 'HIGH_REFUND_BOOK', LOW_ROYALTY_BOOK = 'LOW_ROYALTY_BOOK', MISSING_PROVIDER = 'MISSING_PROVIDER', MISSING_MARKETPLACE = 'MISSING_MARKETPLACE', MISSING_COUNTRY = 'MISSING_COUNTRY', MISSING_FORMAT = 'MISSING_FORMAT', PROVIDER_CONCENTRATION = 'PROVIDER_CONCENTRATION', MARKETPLACE_CONCENTRATION = 'MARKETPLACE_CONCENTRATION', COUNTRY_CONCENTRATION = 'COUNTRY_CONCENTRATION', PRICE_TOO_LOW = 'PRICE_TOO_LOW', PRICE_TOO_HIGH = 'PRICE_TOO_HIGH', PRICE_TEST_RECOMMENDED = 'PRICE_TEST_RECOMMENDED', CATEGORY_MISMATCH = 'CATEGORY_MISMATCH', CATEGORY_EXPANSION = 'CATEGORY_EXPANSION', KEYWORD_GAP = 'KEYWORD_GAP', KEYWORD_DECLINE = 'KEYWORD_DECLINE', METADATA_INCOMPLETE = 'METADATA_INCOMPLETE', COVERAGE_GAP = 'COVERAGE_GAP', SERIES_CROSS_SELL = 'SERIES_CROSS_SELL', FORMAT_CROSS_SELL = 'FORMAT_CROSS_SELL', GEOGRAPHIC_MOMENTUM = 'GEOGRAPHIC_MOMENTUM', MARKETPLACE_MOMENTUM = 'MARKETPLACE_MOMENTUM', PROVIDER_MOMENTUM = 'PROVIDER_MOMENTUM', ROYALTY_RATE_GAP = 'ROYALTY_RATE_GAP', ESTIMATED_FINALIZED_VARIANCE = 'ESTIMATED_FINALIZED_VARIANCE', DATA_MAPPING_REQUIRED = 'DATA_MAPPING_REQUIRED', ANALYTICS_DATA_STALE = 'ANALYTICS_DATA_STALE', ANALYTICS_DATA_INCOMPLETE = 'ANALYTICS_DATA_INCOMPLETE', CUSTOM_RULE = 'CUSTOM_RULE' }
export enum OpportunityStatus { DETECTED = 'DETECTED', ACTIVE = 'ACTIVE', ACCEPTED = 'ACCEPTED', IN_PROGRESS = 'IN_PROGRESS', SNOOZED = 'SNOOZED', DISMISSED = 'DISMISSED', RESOLVED = 'RESOLVED', EXPIRED = 'EXPIRED', INVALIDATED = 'INVALIDATED', SUPERSEDED = 'SUPERSEDED' }
export enum OpportunityRefreshStatus { PENDING = 'PENDING', QUEUED = 'QUEUED', ANALYZING = 'ANALYZING', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', COMPLETED = 'COMPLETED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED', SUPERSEDED = 'SUPERSEDED' }
export enum OpportunityPriority { CRITICAL = 'CRITICAL', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW', INFORMATIONAL = 'INFORMATIONAL' }
export enum OpportunityRiskLevel { VERY_HIGH = 'VERY_HIGH', HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW', VERY_LOW = 'VERY_LOW', UNKNOWN = 'UNKNOWN' }
export enum SuggestedOpportunityActionType { REVIEW_BOOK = 'REVIEW_BOOK', REVIEW_EDITION = 'REVIEW_EDITION', REVIEW_PRICE = 'REVIEW_PRICE', REVIEW_PROVIDER_COVERAGE = 'REVIEW_PROVIDER_COVERAGE', REVIEW_MARKETPLACE_COVERAGE = 'REVIEW_MARKETPLACE_COVERAGE', REVIEW_TERRITORY_COVERAGE = 'REVIEW_TERRITORY_COVERAGE', REVIEW_FORMAT_STRATEGY = 'REVIEW_FORMAT_STRATEGY', REVIEW_CATEGORY = 'REVIEW_CATEGORY', REVIEW_KEYWORDS = 'REVIEW_KEYWORDS', REVIEW_METADATA = 'REVIEW_METADATA', REVIEW_REFUND_CAUSE = 'REVIEW_REFUND_CAUSE', REVIEW_ROYALTY_CONFIGURATION = 'REVIEW_ROYALTY_CONFIGURATION', REFRESH_DATA = 'REFRESH_DATA', COMPLETE_MAPPING = 'COMPLETE_MAPPING', CREATE_PUBLISHING_PLAN = 'CREATE_PUBLISHING_PLAN', REQUEST_AI_INSIGHT = 'REQUEST_AI_INSIGHT' }
export enum OpportunityRefreshMode { INCREMENTAL_REFRESH = 'INCREMENTAL_REFRESH', FULL_REBUILD = 'FULL_REBUILD', SCHEDULED_REFRESH = 'SCHEDULED_REFRESH', EVENT_DRIVEN = 'EVENT_DRIVEN', SNAPSHOT_GENERATION = 'SNAPSHOT_GENERATION' }
export enum OpportunityEventType { OPPORTUNITY_REFRESH_REQUESTED = 'OPPORTUNITY_REFRESH_REQUESTED', OPPORTUNITY_REFRESH_QUEUED = 'OPPORTUNITY_REFRESH_QUEUED', OPPORTUNITY_REFRESH_STARTED = 'OPPORTUNITY_REFRESH_STARTED', OPPORTUNITY_RULE_EVALUATED = 'OPPORTUNITY_RULE_EVALUATED', OPPORTUNITY_DETECTED = 'OPPORTUNITY_DETECTED', OPPORTUNITY_UPDATED = 'OPPORTUNITY_UPDATED', OPPORTUNITY_DUPLICATE_SUPPRESSED = 'OPPORTUNITY_DUPLICATE_SUPPRESSED', OPPORTUNITY_CONFLICT_DETECTED = 'OPPORTUNITY_CONFLICT_DETECTED', OPPORTUNITY_CONFLICT_RESOLVED = 'OPPORTUNITY_CONFLICT_RESOLVED', OPPORTUNITY_ACCEPTED = 'OPPORTUNITY_ACCEPTED', OPPORTUNITY_SNOOZED = 'OPPORTUNITY_SNOOZED', OPPORTUNITY_DISMISSED = 'OPPORTUNITY_DISMISSED', OPPORTUNITY_RESOLVED = 'OPPORTUNITY_RESOLVED', OPPORTUNITY_EXPIRED = 'OPPORTUNITY_EXPIRED', OPPORTUNITY_INVALIDATED = 'OPPORTUNITY_INVALIDATED', OPPORTUNITY_SUPERSEDED = 'OPPORTUNITY_SUPERSEDED', OPPORTUNITY_SNAPSHOT_CREATED = 'OPPORTUNITY_SNAPSHOT_CREATED', OPPORTUNITY_REFRESH_PARTIALLY_COMPLETED = 'OPPORTUNITY_REFRESH_PARTIALLY_COMPLETED', OPPORTUNITY_REFRESH_COMPLETED = 'OPPORTUNITY_REFRESH_COMPLETED', OPPORTUNITY_REFRESH_FAILED = 'OPPORTUNITY_REFRESH_FAILED', OPPORTUNITY_REFRESH_RETRY_SCHEDULED = 'OPPORTUNITY_REFRESH_RETRY_SCHEDULED', OPPORTUNITY_REFRESH_CANCELLED = 'OPPORTUNITY_REFRESH_CANCELLED' }

export type OpportunityDocument = HydratedDocument<Opportunity>;

@Schema({ collection: 'opportunities', timestamps: true, versionKey: 'version' })
export class Opportunity {
  @Prop({ required: true, unique: true, index: true }) opportunityId: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: OpportunityScope, required: true, index: true }) scope: OpportunityScope;
  @Prop({ required: true, index: true }) entityType: string;
  @Prop({ type: String, default: null, index: true }) entityId: string | null;
  @Prop({ type: String, enum: OpportunityCategory, required: true, index: true }) category: OpportunityCategory;
  @Prop({ type: String, enum: OpportunityType, required: true, index: true }) opportunityType: OpportunityType;
  @Prop({ required: true, index: true }) ruleKey: string;
  @Prop({ required: true, index: true }) ruleVersion: string;
  @Prop({ required: true }) titleKey: string;
  @Prop({ type: Object, required: true }) structuredReason: Record<string, unknown>;
  @Prop({ type: String, enum: OpportunityPriority, required: true, index: true }) priority: OpportunityPriority;
  @Prop({ type: String, enum: OpportunityRiskLevel, required: true, index: true }) riskLevel: OpportunityRiskLevel;
  @Prop({ type: String, enum: OpportunityStatus, required: true, index: true }) status: OpportunityStatus;
  @Prop({ required: true, min: 0, max: 100, index: true }) score: number;
  @Prop({ required: true, min: 0, max: 100, index: true }) confidence: number;
  @Prop({ type: Object, default: {} }) scoringFactors: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) evidence: Record<string, unknown>[];
  @Prop({ type: Object, default: null }) estimatedImpact: Record<string, unknown> | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: String, default: null, index: true }) marketplaceId: string | null;
  @Prop({ type: String, default: null, index: true }) countryCode: string | null;
  @Prop({ type: String, default: null, index: true }) territoryCode: string | null;
  @Prop({ type: String, default: null, index: true }) format: string | null;
  @Prop({ type: String, default: null, index: true }) bookId: string | null;
  @Prop({ type: String, default: null, index: true }) editionId: string | null;
  @Prop({ type: String, default: null, index: true }) authorId: string | null;
  @Prop({ type: String, default: null, index: true }) seriesId: string | null;
  @Prop({ type: String, enum: SuggestedOpportunityActionType, required: true }) suggestedActionType: SuggestedOpportunityActionType;
  @Prop({ type: [String], default: [] }) conflictFlags: string[];
  @Prop({ type: Object, default: null }) conflictResolution: Record<string, unknown> | null;
  @Prop({ required: true, unique: true, index: true }) fingerprint: string;
  @Prop({ type: Date, required: true, index: true }) firstDetectedAt: Date;
  @Prop({ type: Date, required: true, index: true }) lastDetectedAt: Date;
  @Prop({ type: Date, default: null }) acceptedAt: Date | null;
  @Prop({ type: String, default: null }) acceptedBy: string | null;
  @Prop({ type: Date, default: null, index: true }) snoozedUntil: Date | null;
  @Prop({ type: String, default: null }) snoozedBy: string | null;
  @Prop({ type: Date, default: null }) dismissedAt: Date | null;
  @Prop({ type: String, default: null }) dismissedBy: string | null;
  @Prop({ type: String, default: null }) dismissalReason: string | null;
  @Prop({ type: Date, default: null }) resolvedAt: Date | null;
  @Prop({ type: String, default: null }) resolvedBy: string | null;
  @Prop({ type: String, default: null }) resolutionReason: string | null;
  @Prop({ type: Date, default: null, index: true }) expiresAt: Date | null;
  @Prop({ type: Date, default: null }) invalidatedAt: Date | null;
  @Prop({ type: String, default: null }) invalidationReason: string | null;
  @Prop({ type: String, default: null }) supersedesOpportunityId: string | null;
  @Prop({ type: String, default: null }) supersededByOpportunityId: string | null;
  @Prop({ type: [String], default: [] }) sourceAnalyticsSnapshotIds: string[];
  @Prop({ required: true }) ruleSetVersion: string;
  @Prop({ required: true }) scoringProfileVersion: string;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const OpportunitySchema = SchemaFactory.createForClass(Opportunity);
OpportunitySchema.index({ projectId: 1, scope: 1, status: 1, isDeleted: 1 });
OpportunitySchema.index({ category: 1, priority: 1, score: -1 });
OpportunitySchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
