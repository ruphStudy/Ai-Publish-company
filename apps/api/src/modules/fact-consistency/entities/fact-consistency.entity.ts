import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum FactConsistencyScope { SECTION = 'SECTION', CHAPTER = 'CHAPTER', MANUSCRIPT = 'MANUSCRIPT' }
export enum FactConsistencyTargetType { SECTION = 'SECTION', BOOK_CONTENT = 'BOOK_CONTENT', MANUSCRIPT = 'MANUSCRIPT' }
export enum FactConsistencyCategory { INTERNAL_CONTRADICTION = 'INTERNAL_CONTRADICTION', CROSS_CHAPTER_CONTRADICTION = 'CROSS_CHAPTER_CONTRADICTION', UNSUPPORTED_CLAIM = 'UNSUPPORTED_CLAIM', CITATION_MISSING = 'CITATION_MISSING', CITATION_MISMATCH = 'CITATION_MISMATCH', TIMELINE_INCONSISTENCY = 'TIMELINE_INCONSISTENCY', DATE_INCONSISTENCY = 'DATE_INCONSISTENCY', NUMERIC_INCONSISTENCY = 'NUMERIC_INCONSISTENCY', STATISTICAL_INCONSISTENCY = 'STATISTICAL_INCONSISTENCY', ENTITY_INCONSISTENCY = 'ENTITY_INCONSISTENCY', NAME_INCONSISTENCY = 'NAME_INCONSISTENCY', LOCATION_INCONSISTENCY = 'LOCATION_INCONSISTENCY', TERMINOLOGY_INCONSISTENCY = 'TERMINOLOGY_INCONSISTENCY', DEFINITION_INCONSISTENCY = 'DEFINITION_INCONSISTENCY', CAUSE_EFFECT_CONFLICT = 'CAUSE_EFFECT_CONFLICT', DUPLICATE_CLAIM_CONFLICT = 'DUPLICATE_CLAIM_CONFLICT', QUALIFICATION_MISSING = 'QUALIFICATION_MISSING', OUTDATED_INFORMATION_RISK = 'OUTDATED_INFORMATION_RISK', UNVERIFIABLE_CLAIM_RISK = 'UNVERIFIABLE_CLAIM_RISK' }
export enum FactRiskLevel { NONE = 'NONE', LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum FactConsistencyStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', COMPLETED = 'COMPLETED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', FAILED = 'FAILED' }
export enum ClaimSupportStatus { SUPPORTED = 'SUPPORTED', PARTIALLY_SUPPORTED = 'PARTIALLY_SUPPORTED', UNSUPPORTED = 'UNSUPPORTED', CONTRADICTED = 'CONTRADICTED', UNCERTAIN = 'UNCERTAIN', NOT_APPLICABLE = 'NOT_APPLICABLE' }
export enum FactIssueSeverity { INFO = 'INFO', LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum FactPublicationRecommendation { PUBLISH = 'PUBLISH', REVIEW = 'REVIEW', REVISE = 'REVISE', BLOCK = 'BLOCK' }
export enum ExternalVerificationBoundary { INTERNAL_CONSISTENCY_VALIDATION = 'INTERNAL_CONSISTENCY_VALIDATION', EXTERNAL_VERIFICATION_PENDING = 'EXTERNAL_VERIFICATION_PENDING', EXTERNAL_VERIFICATION_NOT_REQUIRED = 'EXTERNAL_VERIFICATION_NOT_REQUIRED' }

@Schema({ _id: false })
export class ExtractedClaim {
  @Prop({ required: true }) claimId: string;
  @Prop({ required: true }) text: string;
  @Prop({ required: true }) normalizedText: string;
  @Prop({ required: true }) claimType: string;
  @Prop({ required: true }) sourceLocation: string;
  @Prop({ type: String, default: null }) chapterId: string | null;
  @Prop({ type: String, default: null }) sectionId: string | null;
  @Prop({ type: [String], default: [] }) entities: string[];
  @Prop({ type: [String], default: [] }) dates: string[];
  @Prop({ type: [Number], default: [] }) numericValues: number[];
  @Prop({ type: [String], default: [] }) citations: string[];
  @Prop({ type: String, enum: ClaimSupportStatus, required: true }) supportStatus: ClaimSupportStatus;
  @Prop({ min: 0, max: 100, required: true }) confidence: number;
  @Prop({ type: [String], default: [] }) relatedClaimIds: string[];
  @Prop({ type: [String], default: [] }) contradictionIds: string[];
  @Prop({ type: [String], default: [] }) notes: string[];
}
export const ExtractedClaimSchema = SchemaFactory.createForClass(ExtractedClaim);

@Schema({ _id: false })
export class FactConsistencyIssue {
  @Prop({ required: true }) issueId: string;
  @Prop({ type: String, enum: FactConsistencyCategory, required: true }) category: FactConsistencyCategory;
  @Prop({ type: String, enum: FactIssueSeverity, required: true }) severity: FactIssueSeverity;
  @Prop({ required: true }) message: string;
  @Prop({ required: true }) sourceLocation: string;
  @Prop({ type: [String], default: [] }) relatedLocations: string[];
  @Prop({ type: [String], default: [] }) claimIds: string[];
  @Prop({ type: [String], default: [] }) evidence: string[];
  @Prop({ required: true }) recommendation: string;
  @Prop({ min: 0, max: 100, required: true }) confidence: number;
  @Prop({ default: false }) blockingPublication: boolean;
}
export const FactConsistencyIssueSchema = SchemaFactory.createForClass(FactConsistencyIssue);
export type FactConsistencyDocument = HydratedDocument<FactConsistency>;

@Schema({ collection: 'fact_consistency_validations', timestamps: true, versionKey: 'version' })
export class FactConsistency {
  @Prop({ required: true, unique: true, index: true }) validationId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, enum: FactConsistencyTargetType, required: true, index: true }) targetType: FactConsistencyTargetType;
  @Prop({ required: true, index: true }) targetId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: FactConsistencyScope, required: true }) scope: FactConsistencyScope;
  @Prop({ required: true, min: 0, max: 100 }) overallScore: number;
  @Prop({ required: true, min: 0, max: 100 }) internalConsistencyScore: number;
  @Prop({ required: true, min: 0, max: 100 }) claimSupportScore: number;
  @Prop({ required: true, min: 0, max: 100 }) citationCoverageScore: number;
  @Prop({ required: true, min: 0, max: 100 }) timelineConsistencyScore: number;
  @Prop({ required: true, min: 0, max: 100 }) numericConsistencyScore: number;
  @Prop({ required: true, min: 0, max: 100 }) entityConsistencyScore: number;
  @Prop({ required: true, min: 0, max: 100 }) factRiskScore: number;
  @Prop({ type: String, enum: FactRiskLevel, required: true, index: true }) riskLevel: FactRiskLevel;
  @Prop({ type: String, enum: FactPublicationRecommendation, required: true }) publicationRecommendation: FactPublicationRecommendation;
  @Prop({ type: String, enum: ExternalVerificationBoundary, required: true }) externalVerificationBoundary: ExternalVerificationBoundary;
  @Prop({ type: [ExtractedClaimSchema], default: [] }) extractedClaims: ExtractedClaim[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) contradictions: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) unsupportedClaims: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) citationIssues: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) timelineIssues: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) numericIssues: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) entityIssues: FactConsistencyIssue[];
  @Prop({ type: [FactConsistencyIssueSchema], default: [] }) terminologyIssues: FactConsistencyIssue[];
  @Prop({ type: [String], default: [] }) recommendations: string[];
  @Prop({ required: true }) provider: string;
  @Prop({ required: true }) model: string;
  @Prop({ type: Object, default: {} }) tokenUsage: Record<string, number>;
  @Prop({ required: true, min: 0 }) estimatedCost: number;
  @Prop({ required: true, min: 0 }) processingTime: number;
  @Prop({ type: Object, default: {} }) requestMetadata: Record<string, unknown>;
  @Prop({ type: String, enum: FactConsistencyStatus, required: true, index: true }) status: FactConsistencyStatus;
  @Prop({ required: true, min: 1, index: true }) validationVersion: number;
  @Prop({ type: String, default: null }) failureCode: string | null;
  @Prop({ type: String, default: null }) failureMessage: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const FactConsistencySchema = SchemaFactory.createForClass(FactConsistency);
FactConsistencySchema.index({ projectId: 1, createdAt: -1 });
FactConsistencySchema.index({ targetType: 1, targetId: 1, manuscriptVersion: 1 }, { unique: true });
FactConsistencySchema.index({ projectId: 1, status: 1, riskLevel: 1, isDeleted: 1 });
FactConsistencySchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
