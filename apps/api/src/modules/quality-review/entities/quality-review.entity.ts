import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum QualityReviewStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  COMPLETED = 'COMPLETED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum QualityReviewCategory {
  GRAMMAR = 'GRAMMAR',
  SPELLING = 'SPELLING',
  READABILITY = 'READABILITY',
  STRUCTURE = 'STRUCTURE',
  CONSISTENCY = 'CONSISTENCY',
  TONE = 'TONE',
  DUPLICATE_CONTENT = 'DUPLICATE_CONTENT',
  AI_REPETITION = 'AI_REPETITION',
  SEO = 'SEO',
  CHAPTER_BALANCE = 'CHAPTER_BALANCE',
  FORMATTING = 'FORMATTING',
  COMPLETENESS = 'COMPLETENESS',
}

export enum QualityIssueSeverity {
  INFO = 'INFO',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum PublicationReadiness {
  READY = 'READY',
  NEEDS_REVIEW = 'NEEDS_REVIEW',
  NOT_READY = 'NOT_READY',
}

@Schema({ _id: false })
export class QualityCategoryScore {
  @Prop({ type: String, enum: QualityReviewCategory, required: true })
  category: QualityReviewCategory;

  @Prop({ type: Number, required: true, min: 0, max: 100 })
  score: number;

  @Prop({ type: Number, required: true, min: 0, max: 1 })
  weight: number;
}

export const QualityCategoryScoreSchema = SchemaFactory.createForClass(QualityCategoryScore);

@Schema({ _id: false })
export class QualityIssue {
  @Prop({ type: String, enum: QualityReviewCategory, required: true })
  category: QualityReviewCategory;

  @Prop({ type: String, enum: QualityIssueSeverity, required: true })
  severity: QualityIssueSeverity;

  @Prop({ type: String, required: true, trim: true })
  message: string;

  @Prop({ type: String, trim: true })
  location?: string;

  @Prop({ type: String, trim: true })
  suggestion?: string;
}

export const QualityIssueSchema = SchemaFactory.createForClass(QualityIssue);

export type QualityReviewDocument = HydratedDocument<QualityReview>;

@Schema({ collection: 'quality_reviews', timestamps: true, versionKey: 'version' })
export class QualityReview {
  @Prop({ required: true, unique: true, index: true, trim: true })
  reviewId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, index: true })
  blueprintId: string;

  @Prop({ type: [String], required: true, default: [] })
  contentIds: string[];

  @Prop({ type: Number, required: true, min: 0, max: 100, index: true })
  overallQualityScore: number;

  @Prop({ type: [QualityCategoryScoreSchema], required: true, default: [] })
  categoryScores: QualityCategoryScore[];

  @Prop({ type: [QualityIssueSchema], required: true, default: [] })
  issues: QualityIssue[];

  @Prop({ type: [String], required: true, default: [] })
  suggestions: string[];

  @Prop({ type: String, enum: QualityIssueSeverity, required: true, index: true })
  severity: QualityIssueSeverity;

  @Prop({ type: String, enum: PublicationReadiness, required: true, index: true })
  publicationReadiness: PublicationReadiness;

  @Prop({ required: true, trim: true, index: true })
  reviewVersion: string;

  @Prop({ type: String, enum: QualityReviewStatus, required: true, default: QualityReviewStatus.PENDING, index: true })
  status: QualityReviewStatus;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, default: null })
  deletedBy: string | null;

  @Prop({ type: String, default: null })
  createdBy: string | null;

  @Prop({ type: String, default: null })
  updatedBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}

export const QualityReviewSchema = SchemaFactory.createForClass(QualityReview);

QualityReviewSchema.index({ projectId: 1, createdAt: -1 });
QualityReviewSchema.index({ projectId: 1, reviewVersion: 1 }, { unique: true });
QualityReviewSchema.index({ status: 1, publicationReadiness: 1, isDeleted: 1 });
QualityReviewSchema.pre(/^find/, function () {
  const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown };
  if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false });
});
