import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { QualityIssueSeverity } from '../../quality-review/entities/quality-review.entity';

export enum ImprovementScope { SECTION = 'SECTION', CHAPTER = 'CHAPTER', MANUSCRIPT = 'MANUSCRIPT' }
export enum ImprovementMode { GRAMMAR = 'GRAMMAR', READABILITY = 'READABILITY', CLARITY = 'CLARITY', TONE = 'TONE', STRUCTURE = 'STRUCTURE', REPETITION = 'REPETITION', SEO = 'SEO', COMPREHENSIVE = 'COMPREHENSIVE' }
export enum ImprovementTargetType { BOOK_CONTENT = 'BOOK_CONTENT', SECTION = 'SECTION', MANUSCRIPT = 'MANUSCRIPT' }
export enum ContentImprovementStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', COMPLETED = 'COMPLETED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', APPLIED = 'APPLIED', FAILED = 'FAILED' }

@Schema({ _id: false })
export class ImprovementMetrics {
  @Prop({ required: true, min: 0, max: 100 }) grammarImprovement: number;
  @Prop({ required: true, min: 0, max: 100 }) readabilityImprovement: number;
  @Prop({ required: true, min: 0, max: 100 }) clarityImprovement: number;
  @Prop({ required: true, min: 0, max: 100 }) repetitionReduction: number;
  @Prop({ required: true, min: 0, max: 100 }) consistencyImprovement: number;
  @Prop({ required: true, min: 0, max: 100 }) overallEstimatedImprovement: number;
  @Prop({ required: true, min: 0 }) issuesAddressedCount: number;
  @Prop({ required: true, min: 0 }) unresolvedIssuesCount: number;
}
export const ImprovementMetricsSchema = SchemaFactory.createForClass(ImprovementMetrics);

export type ContentImprovementDocument = HydratedDocument<ContentImprovement>;

@Schema({ collection: 'content_improvements', timestamps: true, versionKey: 'version' })
export class ContentImprovement {
  @Prop({ required: true, unique: true, index: true }) improvementId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) qualityReviewId: string;
  @Prop({ type: String, enum: ImprovementTargetType, required: true, index: true }) targetType: ImprovementTargetType;
  @Prop({ required: true, index: true }) targetId: string;
  @Prop({ type: String, enum: ImprovementScope, required: true, index: true }) scope: ImprovementScope;
  @Prop({ type: String, enum: ImprovementMode, required: true }) mode: ImprovementMode;
  @Prop({ type: String, enum: QualityIssueSeverity, required: true }) minimumSeverity: QualityIssueSeverity;
  @Prop({ required: true }) originalContent: string;
  @Prop({ required: true, default: '' }) improvedContent: string;
  @Prop({ required: true, min: 0 }) originalWordCount: number;
  @Prop({ required: true, min: 0 }) improvedWordCount: number;
  @Prop({ required: true }) wordCountDifference: number;
  @Prop({ type: [String], default: [] }) appliedIssueIds: string[];
  @Prop({ type: [String], default: [] }) unresolvedIssueIds: string[];
  @Prop({ required: true, default: '' }) improvementSummary: string;
  @Prop({ type: ImprovementMetricsSchema, required: true }) improvementMetrics: ImprovementMetrics;
  @Prop({ required: true, default: 'pending' }) aiProvider: string;
  @Prop({ required: true, default: 'pending' }) aiModel: string;
  @Prop({ type: Object, default: {} }) tokenUsage: Record<string, number>;
  @Prop({ required: true, min: 0, default: 0 }) estimatedCost: number;
  @Prop({ required: true, min: 0, default: 0 }) latencyMs: number;
  @Prop({ type: Object, default: {} }) requestMetadata: Record<string, unknown>;
  @Prop({ type: String, enum: ContentImprovementStatus, required: true, default: ContentImprovementStatus.PENDING, index: true }) status: ContentImprovementStatus;
  @Prop({ required: true, min: 1, index: true }) improvementVersion: number;
  @Prop({ type: String, default: null }) failureCode: string | null;
  @Prop({ type: String, default: null }) failureMessage: string | null;
  @Prop({ type: [String], default: [] }) appliedContentVersionIds: string[];
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const ContentImprovementSchema = SchemaFactory.createForClass(ContentImprovement);
ContentImprovementSchema.index({ projectId: 1, createdAt: -1 });
ContentImprovementSchema.index({ targetType: 1, targetId: 1, improvementVersion: -1 });
ContentImprovementSchema.index({ qualityReviewId: 1, status: 1 });
ContentImprovementSchema.index({ projectId: 1, status: 1, isDeleted: 1 });
ContentImprovementSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
