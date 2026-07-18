import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum AmazonKdpProviderKey { AMAZON_KDP = 'AMAZON_KDP' }
export enum AmazonKdpIntegrationMode { MANUAL_ASSISTED = 'MANUAL_ASSISTED', API = 'API' }
export enum AmazonKdpFormat { KINDLE_EBOOK = 'KINDLE_EBOOK', PAPERBACK = 'PAPERBACK', HARDCOVER = 'HARDCOVER' }
export enum AmazonKdpStage { CONFIGURATION_VALIDATION = 'CONFIGURATION_VALIDATION', METADATA_VALIDATION = 'METADATA_VALIDATION', CONTENT_VALIDATION = 'CONTENT_VALIDATION', COVER_VALIDATION = 'COVER_VALIDATION', PRINT_OPTIONS_VALIDATION = 'PRINT_OPTIONS_VALIDATION', RIGHTS_VALIDATION = 'RIGHTS_VALIDATION', PRICING_VALIDATION = 'PRICING_VALIDATION', PACKAGE_PREPARATION = 'PACKAGE_PREPARATION', READY_FOR_MANUAL_SUBMISSION = 'READY_FOR_MANUAL_SUBMISSION', MANUAL_SUBMISSION_RECORDED = 'MANUAL_SUBMISSION_RECORDED', KDP_REVIEW = 'KDP_REVIEW', PUBLISHING = 'PUBLISHING', PUBLISHED = 'PUBLISHED', ACTION_REQUIRED = 'ACTION_REQUIRED', REJECTED = 'REJECTED', BLOCKED = 'BLOCKED', UNPUBLISHED = 'UNPUBLISHED' }
export enum AmazonKdpStatus { DRAFT = 'DRAFT', READY_FOR_SUBMISSION = 'READY_FOR_SUBMISSION', SUBMISSION_RECORDED = 'SUBMISSION_RECORDED', IN_REVIEW = 'IN_REVIEW', PUBLISHING = 'PUBLISHING', LIVE = 'LIVE', ACTION_REQUIRED = 'ACTION_REQUIRED', BLOCKED = 'BLOCKED', REJECTED = 'REJECTED', UNPUBLISHED = 'UNPUBLISHED', UNKNOWN = 'UNKNOWN' }
export enum AmazonKdpChecklistStatus { NOT_STARTED = 'NOT_STARTED', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }

@Schema({ _id: false })
export class AmazonKdpChecklistItem {
  @Prop({ required: true, min: 1 }) sequence: number;
  @Prop({ required: true }) category: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) required: boolean;
  @Prop({ type: String, enum: AmazonKdpChecklistStatus, required: true }) completionStatus: AmazonKdpChecklistStatus;
  @Prop({ type: String, default: null }) sourceApcField: string | null;
  @Prop({ type: String, default: null }) mappedValue: string | null;
  @Prop({ required: true }) validationStatus: string;
  @Prop({ type: String, default: null }) warning: string | null;
  @Prop({ required: true }) manualConfirmationRequired: boolean;
}
export const AmazonKdpChecklistItemSchema = SchemaFactory.createForClass(AmazonKdpChecklistItem);

@Schema({ _id: false })
export class AmazonKdpStatusHistoryItem {
  @Prop({ type: String, enum: AmazonKdpStatus, required: true }) status: AmazonKdpStatus;
  @Prop({ required: true }) statusMessage: string;
  @Prop({ type: Date, required: true }) recordedAt: Date;
  @Prop({ type: String, default: null }) recordedBy: string | null;
}
export const AmazonKdpStatusHistoryItemSchema = SchemaFactory.createForClass(AmazonKdpStatusHistoryItem);
export type AmazonKdpPackageDocument = HydratedDocument<AmazonKdpPackage>;

@Schema({ collection: 'amazon_kdp_packages', timestamps: true, versionKey: 'version' })
export class AmazonKdpPackage {
  @Prop({ required: true, unique: true, index: true }) packageId: string;
  @Prop({ required: true, index: true }) workflowId: string;
  @Prop({ required: true, index: true }) targetExecutionId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: AmazonKdpProviderKey, required: true, index: true }) providerKey: AmazonKdpProviderKey;
  @Prop({ type: String, enum: AmazonKdpIntegrationMode, required: true }) integrationMode: AmazonKdpIntegrationMode;
  @Prop({ type: String, enum: AmazonKdpFormat, required: true, index: true }) kdpFormat: AmazonKdpFormat;
  @Prop({ required: true }) primaryMarketplace: string;
  @Prop({ type: Object, required: true }) metadataSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) rightsSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) pricingSnapshot: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) printOptionsSnapshot: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) artifactReferences: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) coverReferences: Record<string, unknown>[];
  @Prop({ required: true, index: true }) submissionFingerprint: string;
  @Prop({ required: true, min: 1, index: true }) packageVersion: number;
  @Prop({ required: true }) checklistVersion: string;
  @Prop({ type: [AmazonKdpChecklistItemSchema], default: [] }) checklist: AmazonKdpChecklistItem[];
  @Prop({ type: String, enum: AmazonKdpChecklistStatus, required: true }) checklistStatus: AmazonKdpChecklistStatus;
  @Prop({ type: String, enum: AmazonKdpStatus, required: true, index: true }) status: AmazonKdpStatus;
  @Prop({ type: String, default: null, index: true }) externalTitleId: string | null;
  @Prop({ type: String, default: null, index: true }) asin: string | null;
  @Prop({ type: String, default: null, index: true }) isbn: string | null;
  @Prop({ type: String, default: null }) externalStatus: string | null;
  @Prop({ type: String, default: null }) externalStatusMessage: string | null;
  @Prop({ type: Date, default: null }) readyForManualSubmissionAt: Date | null;
  @Prop({ type: Date, default: null }) submittedAt: Date | null;
  @Prop({ type: Date, default: null }) publishedAt: Date | null;
  @Prop({ type: Date, default: null }) rejectedAt: Date | null;
  @Prop({ type: Date, default: null }) actionRequiredAt: Date | null;
  @Prop({ type: String, default: null }) submittedBy: string | null;
  @Prop({ type: String, default: null }) lastStatusUpdatedBy: string | null;
  @Prop({ type: Object, default: {} }) sourceResultIds: Record<string, string>;
  @Prop({ type: [String], default: [] }) validationIssues: string[];
  @Prop({ type: [String], default: [] }) warnings: string[];
  @Prop({ type: [AmazonKdpStatusHistoryItemSchema], default: [] }) statusHistory: AmazonKdpStatusHistoryItem[];
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const AmazonKdpPackageSchema = SchemaFactory.createForClass(AmazonKdpPackage);
AmazonKdpPackageSchema.index({ projectId: 1, createdAt: -1 });
AmazonKdpPackageSchema.index({ targetExecutionId: 1, packageVersion: -1 });
AmazonKdpPackageSchema.index({ submissionFingerprint: 1, kdpFormat: 1, isDeleted: 1 });
AmazonKdpPackageSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
