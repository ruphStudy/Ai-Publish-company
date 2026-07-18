import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum PlagiarismDetectionScope { SECTION = 'SECTION', CHAPTER = 'CHAPTER', MANUSCRIPT = 'MANUSCRIPT' }
export enum PlagiarismTargetType { SECTION = 'SECTION', BOOK_CONTENT = 'BOOK_CONTENT', MANUSCRIPT = 'MANUSCRIPT' }
export enum PlagiarismCategory { EXACT_DUPLICATE = 'EXACT_DUPLICATE', NEAR_DUPLICATE = 'NEAR_DUPLICATE', INTERNAL_DUPLICATE = 'INTERNAL_DUPLICATE', REPETITIVE_AI_CONTENT = 'REPETITIVE_AI_CONTENT', COPYRIGHT_RISK = 'COPYRIGHT_RISK', QUOTE_DETECTION = 'QUOTE_DETECTION', CITATION_DETECTION = 'CITATION_DETECTION', PUBLIC_DOMAIN_INDICATOR = 'PUBLIC_DOMAIN_INDICATOR', SIMILAR_STRUCTURE = 'SIMILAR_STRUCTURE', SIMILAR_TITLE = 'SIMILAR_TITLE', SIMILAR_HEADING = 'SIMILAR_HEADING', SIMILAR_PARAGRAPH = 'SIMILAR_PARAGRAPH', SIMILAR_SENTENCE = 'SIMILAR_SENTENCE' }
export enum PlagiarismRiskLevel { NONE = 'NONE', LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum PublicationRecommendation { PUBLISH = 'PUBLISH', REVIEW = 'REVIEW', REVISE = 'REVISE', BLOCK = 'BLOCK' }
export enum PlagiarismDetectionStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', COMPLETED = 'COMPLETED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', FAILED = 'FAILED' }

@Schema({ _id: false })
export class PlagiarismFinding {
  @Prop({ type: String, enum: PlagiarismCategory, required: true }) category: PlagiarismCategory;
  @Prop({ type: String, enum: PlagiarismRiskLevel, required: true }) riskLevel: PlagiarismRiskLevel;
  @Prop({ required: true }) message: string;
  @Prop({ required: true, min: 0, max: 100 }) confidence: number;
  @Prop({ type: [String], default: [] }) locations: string[];
}
export const PlagiarismFindingSchema = SchemaFactory.createForClass(PlagiarismFinding);

@Schema({ _id: false })
export class MatchedSection {
  @Prop({ required: true }) sourceLocation: string;
  @Prop({ required: true }) matchedLocation: string;
  @Prop({ required: true, min: 0, max: 100 }) similarity: number;
  @Prop({ type: String, enum: PlagiarismCategory, required: true }) category: PlagiarismCategory;
}
export const MatchedSectionSchema = SchemaFactory.createForClass(MatchedSection);

export type PlagiarismDetectionDocument = HydratedDocument<PlagiarismDetection>;

@Schema({ collection: 'plagiarism_detections', timestamps: true, versionKey: 'version' })
export class PlagiarismDetection {
  @Prop({ required: true, unique: true, index: true }) detectionId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, enum: PlagiarismTargetType, required: true, index: true }) targetType: PlagiarismTargetType;
  @Prop({ required: true, index: true }) targetId: string;
  @Prop({ type: String, enum: PlagiarismDetectionScope, required: true }) scope: PlagiarismDetectionScope;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ required: true, min: 0, max: 100 }) originalityScore: number;
  @Prop({ required: true, min: 0, max: 100 }) similarityScore: number;
  @Prop({ required: true, min: 0, max: 100 }) duplicateScore: number;
  @Prop({ required: true, min: 0, max: 100 }) copyrightRiskScore: number;
  @Prop({ required: true, min: 0, max: 100 }) aiRepetitionScore: number;
  @Prop({ type: String, enum: PlagiarismRiskLevel, required: true, index: true }) riskLevel: PlagiarismRiskLevel;
  @Prop({ type: String, enum: PublicationRecommendation, required: true }) publicationRecommendation: PublicationRecommendation;
  @Prop({ type: [PlagiarismFindingSchema], default: [] }) findings: PlagiarismFinding[];
  @Prop({ type: [MatchedSectionSchema], default: [] }) matchedSections: MatchedSection[];
  @Prop({ type: [String], default: [] }) duplicateLocations: string[];
  @Prop({ type: [String], default: [] }) recommendations: string[];
  @Prop({ required: true }) provider: string;
  @Prop({ required: true }) model: string;
  @Prop({ type: Object, default: {} }) tokenUsage: Record<string, number>;
  @Prop({ required: true, min: 0 }) estimatedCost: number;
  @Prop({ required: true, min: 0 }) processingTime: number;
  @Prop({ type: String, enum: PlagiarismDetectionStatus, required: true, default: PlagiarismDetectionStatus.PENDING, index: true }) status: PlagiarismDetectionStatus;
  @Prop({ required: true, min: 1, index: true }) detectionVersion: number;
  @Prop({ type: String, default: null }) failureCode: string | null;
  @Prop({ type: String, default: null }) failureMessage: string | null;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const PlagiarismDetectionSchema = SchemaFactory.createForClass(PlagiarismDetection);
PlagiarismDetectionSchema.index({ projectId: 1, createdAt: -1 });
PlagiarismDetectionSchema.index({ targetType: 1, targetId: 1, manuscriptVersion: 1 }, { unique: true });
PlagiarismDetectionSchema.index({ projectId: 1, status: 1, isDeleted: 1 });
PlagiarismDetectionSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
