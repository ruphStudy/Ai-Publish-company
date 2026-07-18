import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum GooglePlayBooksProviderKey { GOOGLE_PLAY_BOOKS = 'GOOGLE_PLAY_BOOKS' }
export enum GooglePlayBooksIntegrationMode { MANUAL_ASSISTED = 'MANUAL_ASSISTED', API = 'API' }
export enum GooglePlayBooksFormat { EPUB = 'EPUB', PDF_EBOOK = 'PDF_EBOOK' }
export enum GooglePlayBooksIdentifierStrategy { ISBN = 'ISBN', GOOGLE_GENERATED_IDENTIFIER = 'GOOGLE_GENERATED_IDENTIFIER' }
export enum GooglePlayBooksStage { CONFIGURATION_VALIDATION = 'CONFIGURATION_VALIDATION', METADATA_VALIDATION = 'METADATA_VALIDATION', CONTENT_VALIDATION = 'CONTENT_VALIDATION', COVER_VALIDATION = 'COVER_VALIDATION', RIGHTS_VALIDATION = 'RIGHTS_VALIDATION', PRICING_VALIDATION = 'PRICING_VALIDATION', TERRITORY_VALIDATION = 'TERRITORY_VALIDATION', PACKAGE_PREPARATION = 'PACKAGE_PREPARATION', READY_FOR_MANUAL_SUBMISSION = 'READY_FOR_MANUAL_SUBMISSION', MANUAL_SUBMISSION_RECORDED = 'MANUAL_SUBMISSION_RECORDED', FILE_PROCESSING = 'FILE_PROCESSING', ACTION_REQUIRED = 'ACTION_REQUIRED', REVIEW = 'REVIEW', PUBLISHING = 'PUBLISHING', PUBLISHED = 'PUBLISHED', BLOCKED = 'BLOCKED', REJECTED = 'REJECTED', REMOVED = 'REMOVED' }
export enum GooglePlayBooksStatus { DRAFT = 'DRAFT', READY_FOR_SUBMISSION = 'READY_FOR_SUBMISSION', SUBMISSION_RECORDED = 'SUBMISSION_RECORDED', PROCESSING = 'PROCESSING', IN_REVIEW = 'IN_REVIEW', PUBLISHING = 'PUBLISHING', LIVE = 'LIVE', ACTION_REQUIRED = 'ACTION_REQUIRED', BLOCKED = 'BLOCKED', REJECTED = 'REJECTED', REMOVED = 'REMOVED', UNKNOWN = 'UNKNOWN' }
export enum GooglePlayBooksFileProcessingStatus { PENDING = 'PENDING', PROCESSING = 'PROCESSING', PROCESSED = 'PROCESSED', ACTION_REQUIRED = 'ACTION_REQUIRED', FAILED = 'FAILED', REPLACED = 'REPLACED' }
export enum GooglePlayBooksChecklistStatus { NOT_STARTED = 'NOT_STARTED', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }

@Schema({ _id: false })
export class GooglePlayBooksChecklistItem {
  @Prop({ required: true, min: 1 }) sequence: number;
  @Prop({ required: true }) category: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) required: boolean;
  @Prop({ type: String, enum: GooglePlayBooksChecklistStatus, required: true }) completionStatus: GooglePlayBooksChecklistStatus;
  @Prop({ type: String, default: null }) sourceApcField: string | null;
  @Prop({ type: String, default: null }) mappedValue: string | null;
  @Prop({ required: true }) validationStatus: string;
  @Prop({ type: String, default: null }) warning: string | null;
  @Prop({ required: true }) manualConfirmationRequired: boolean;
}
export const GooglePlayBooksChecklistItemSchema = SchemaFactory.createForClass(GooglePlayBooksChecklistItem);

@Schema({ _id: false })
export class GooglePlayBooksStatusHistoryItem {
  @Prop({ type: String, enum: GooglePlayBooksStatus, required: true }) status: GooglePlayBooksStatus;
  @Prop({ required: true }) statusMessage: string;
  @Prop({ type: Date, required: true }) recordedAt: Date;
  @Prop({ type: String, default: null }) recordedBy: string | null;
}
export const GooglePlayBooksStatusHistoryItemSchema = SchemaFactory.createForClass(GooglePlayBooksStatusHistoryItem);

@Schema({ _id: false })
export class GooglePlayBooksProcessingHistoryItem {
  @Prop({ type: String, enum: GooglePlayBooksFileProcessingStatus, required: true }) status: GooglePlayBooksFileProcessingStatus;
  @Prop({ required: true }) fileType: string;
  @Prop({ required: true }) statusMessage: string;
  @Prop({ type: Date, required: true }) recordedAt: Date;
  @Prop({ type: String, default: null }) recordedBy: string | null;
}
export const GooglePlayBooksProcessingHistoryItemSchema = SchemaFactory.createForClass(GooglePlayBooksProcessingHistoryItem);

export type GooglePlayBooksPackageDocument = HydratedDocument<GooglePlayBooksPackage>;

@Schema({ collection: 'google_play_books_packages', timestamps: true, versionKey: 'version' })
export class GooglePlayBooksPackage {
  @Prop({ required: true, unique: true, index: true }) packageId: string;
  @Prop({ required: true, index: true }) workflowId: string;
  @Prop({ required: true, index: true }) targetExecutionId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: GooglePlayBooksProviderKey, required: true, index: true }) providerKey: GooglePlayBooksProviderKey;
  @Prop({ type: String, enum: GooglePlayBooksIntegrationMode, required: true }) integrationMode: GooglePlayBooksIntegrationMode;
  @Prop({ type: String, enum: GooglePlayBooksFormat, required: true, index: true }) contentFormat: GooglePlayBooksFormat;
  @Prop({ type: String, enum: GooglePlayBooksIdentifierStrategy, required: true }) identifierStrategy: GooglePlayBooksIdentifierStrategy;
  @Prop({ type: String, default: null, index: true }) isbn: string | null;
  @Prop({ type: String, default: null, index: true }) googleBookIdentifier: string | null;
  @Prop({ type: String, default: null, index: true }) externalBookReference: string | null;
  @Prop({ type: String, default: null }) accountProfileReference: string | null;
  @Prop({ type: Object, required: true }) metadataSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) rightsSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) territorySnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) pricingSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) previewSnapshot: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) artifactReferences: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) coverReferences: Record<string, unknown>[];
  @Prop({ required: true, index: true }) submissionFingerprint: string;
  @Prop({ required: true, min: 1, index: true }) packageVersion: number;
  @Prop({ required: true }) checklistVersion: string;
  @Prop({ type: [GooglePlayBooksChecklistItemSchema], default: [] }) checklist: GooglePlayBooksChecklistItem[];
  @Prop({ type: String, enum: GooglePlayBooksChecklistStatus, required: true }) checklistStatus: GooglePlayBooksChecklistStatus;
  @Prop({ type: String, enum: GooglePlayBooksStatus, required: true, index: true }) status: GooglePlayBooksStatus;
  @Prop({ type: String, enum: GooglePlayBooksFileProcessingStatus, required: true }) contentProcessingStatus: GooglePlayBooksFileProcessingStatus;
  @Prop({ type: String, enum: GooglePlayBooksFileProcessingStatus, required: true }) coverProcessingStatus: GooglePlayBooksFileProcessingStatus;
  @Prop({ type: String, default: null }) externalStatus: string | null;
  @Prop({ type: String, default: null }) externalStatusMessage: string | null;
  @Prop({ type: Date, default: null }) readyForManualSubmissionAt: Date | null;
  @Prop({ type: Date, default: null }) submittedAt: Date | null;
  @Prop({ type: Date, default: null }) processingStartedAt: Date | null;
  @Prop({ type: Date, default: null }) publishedAt: Date | null;
  @Prop({ type: Date, default: null }) rejectedAt: Date | null;
  @Prop({ type: Date, default: null }) removedAt: Date | null;
  @Prop({ type: Date, default: null }) actionRequiredAt: Date | null;
  @Prop({ type: String, default: null }) submittedBy: string | null;
  @Prop({ type: String, default: null }) lastStatusUpdatedBy: string | null;
  @Prop({ type: Object, default: {} }) sourceResultIds: Record<string, string>;
  @Prop({ type: [String], default: [] }) validationIssues: string[];
  @Prop({ type: [String], default: [] }) warnings: string[];
  @Prop({ type: [GooglePlayBooksStatusHistoryItemSchema], default: [] }) statusHistory: GooglePlayBooksStatusHistoryItem[];
  @Prop({ type: [GooglePlayBooksProcessingHistoryItemSchema], default: [] }) processingHistory: GooglePlayBooksProcessingHistoryItem[];
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const GooglePlayBooksPackageSchema = SchemaFactory.createForClass(GooglePlayBooksPackage);
GooglePlayBooksPackageSchema.index({ projectId: 1, createdAt: -1 });
GooglePlayBooksPackageSchema.index({ targetExecutionId: 1, packageVersion: -1 });
GooglePlayBooksPackageSchema.index({ submissionFingerprint: 1, contentFormat: 1, isDeleted: 1 });
GooglePlayBooksPackageSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
