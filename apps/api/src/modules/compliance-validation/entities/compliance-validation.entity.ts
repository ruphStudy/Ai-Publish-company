import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum ComplianceValidationScope { SECTION = 'SECTION', CHAPTER = 'CHAPTER', MANUSCRIPT = 'MANUSCRIPT', BOOK = 'BOOK' }
export enum ComplianceValidationTargetType { SECTION = 'SECTION', BOOK_CONTENT = 'BOOK_CONTENT', MANUSCRIPT = 'MANUSCRIPT', BOOK = 'BOOK' }
export enum ComplianceCategory { BOOK_STRUCTURE = 'BOOK_STRUCTURE', TABLE_OF_CONTENTS = 'TABLE_OF_CONTENTS', CHAPTER_ORGANIZATION = 'CHAPTER_ORGANIZATION', HEADING_HIERARCHY = 'HEADING_HIERARCHY', METADATA_COMPLETENESS = 'METADATA_COMPLETENESS', ISBN_READINESS = 'ISBN_READINESS', COPYRIGHT_PAGE = 'COPYRIGHT_PAGE', DISCLAIMER_PRESENCE = 'DISCLAIMER_PRESENCE', AUTHOR_INFORMATION = 'AUTHOR_INFORMATION', CITATION_FORMAT = 'CITATION_FORMAT', REFERENCE_CONSISTENCY = 'REFERENCE_CONSISTENCY', FOOTNOTE_CONSISTENCY = 'FOOTNOTE_CONSISTENCY', IMAGE_REFERENCE_VALIDATION = 'IMAGE_REFERENCE_VALIDATION', INTERNAL_LINK_VALIDATION = 'INTERNAL_LINK_VALIDATION', MARKDOWN_VALIDATION = 'MARKDOWN_VALIDATION', HTML_VALIDATION = 'HTML_VALIDATION', EPUB_READINESS = 'EPUB_READINESS', PDF_READINESS = 'PDF_READINESS', DOCX_READINESS = 'DOCX_READINESS', PRINT_READINESS = 'PRINT_READINESS', ACCESSIBILITY_VALIDATION = 'ACCESSIBILITY_VALIDATION', SEO_METADATA = 'SEO_METADATA', KEYWORD_COVERAGE = 'KEYWORD_COVERAGE', CATEGORY_ASSIGNMENT = 'CATEGORY_ASSIGNMENT', FILE_NAMING = 'FILE_NAMING', VERSION_CONSISTENCY = 'VERSION_CONSISTENCY', LANGUAGE_CONSISTENCY = 'LANGUAGE_CONSISTENCY', PUBLICATION_CONFIGURATION = 'PUBLICATION_CONFIGURATION', EXPORT_DEPENDENCY_VALIDATION = 'EXPORT_DEPENDENCY_VALIDATION' }
export enum ComplianceLevel { PASS = 'PASS', WARNING = 'WARNING', FAIL = 'FAIL' }
export enum ComplianceIssueSeverity { INFO = 'INFO', LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum ComplianceValidationStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', COMPLETED = 'COMPLETED', APPROVED = 'APPROVED', REJECTED = 'REJECTED', FAILED = 'FAILED' }

@Schema({ _id: false })
export class ComplianceCheck {
  @Prop({ required: true }) checkId: string;
  @Prop({ type: String, enum: ComplianceCategory, required: true }) category: ComplianceCategory;
  @Prop({ type: String, enum: ComplianceIssueSeverity, required: true }) severity: ComplianceIssueSeverity;
  @Prop({ required: true }) message: string;
  @Prop({ required: true }) location: string;
  @Prop({ required: true }) recommendation: string;
  @Prop({ default: false }) blocking: boolean;
  @Prop({ min: 0, max: 100, required: true }) confidence: number;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
}
export const ComplianceCheckSchema = SchemaFactory.createForClass(ComplianceCheck);
export type ComplianceValidationDocument = HydratedDocument<ComplianceValidation>;

@Schema({ collection: 'compliance_validations', timestamps: true, versionKey: 'version' })
export class ComplianceValidation {
  @Prop({ required: true, unique: true, index: true }) validationId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, enum: ComplianceValidationTargetType, required: true, index: true }) targetType: ComplianceValidationTargetType;
  @Prop({ required: true, index: true }) targetId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: ComplianceValidationScope, required: true }) scope: ComplianceValidationScope;
  @Prop({ required: true, min: 0, max: 100 }) overallScore: number;
  @Prop({ required: true, min: 0, max: 100 }) structuralScore: number;
  @Prop({ required: true, min: 0, max: 100 }) metadataScore: number;
  @Prop({ required: true, min: 0, max: 100 }) accessibilityScore: number;
  @Prop({ required: true, min: 0, max: 100 }) seoScore: number;
  @Prop({ required: true, min: 0, max: 100 }) exportReadinessScore: number;
  @Prop({ required: true, min: 0, max: 100 }) publicationReadinessScore: number;
  @Prop({ type: String, enum: ComplianceLevel, required: true, index: true }) complianceLevel: ComplianceLevel;
  @Prop({ required: true, min: 0 }) blockingIssueCount: number;
  @Prop({ required: true, min: 0 }) warningCount: number;
  @Prop({ required: true, min: 0 }) recommendationCount: number;
  @Prop({ type: [ComplianceCheckSchema], default: [] }) passedChecks: ComplianceCheck[];
  @Prop({ type: [ComplianceCheckSchema], default: [] }) failedChecks: ComplianceCheck[];
  @Prop({ type: [ComplianceCheckSchema], default: [] }) warnings: ComplianceCheck[];
  @Prop({ type: [String], default: [] }) recommendations: string[];
  @Prop({ required: true }) provider: string;
  @Prop({ required: true }) model: string;
  @Prop({ type: Object, default: {} }) tokenUsage: Record<string, number>;
  @Prop({ required: true, min: 0 }) estimatedCost: number;
  @Prop({ required: true, min: 0 }) processingTime: number;
  @Prop({ type: Object, default: {} }) requestMetadata: Record<string, unknown>;
  @Prop({ type: String, enum: ComplianceValidationStatus, required: true, index: true }) status: ComplianceValidationStatus;
  @Prop({ required: true, min: 1, index: true }) complianceVersion: number;
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
export const ComplianceValidationSchema = SchemaFactory.createForClass(ComplianceValidation);
ComplianceValidationSchema.index({ projectId: 1, createdAt: -1 });
ComplianceValidationSchema.index({ targetType: 1, targetId: 1, manuscriptVersion: 1 }, { unique: true });
ComplianceValidationSchema.index({ projectId: 1, status: 1, complianceLevel: 1, isDeleted: 1 });
ComplianceValidationSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
