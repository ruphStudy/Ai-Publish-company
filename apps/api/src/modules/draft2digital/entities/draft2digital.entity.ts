import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum Draft2DigitalProviderKey { DRAFT2DIGITAL = 'DRAFT2DIGITAL' }
export enum Draft2DigitalIntegrationMode { MANUAL_ASSISTED = 'MANUAL_ASSISTED', API = 'API' }
export enum Draft2DigitalFormat { EPUB = 'EPUB', PRINT = 'PRINT' }
export enum Draft2DigitalStage { CONFIGURATION_VALIDATION = 'CONFIGURATION_VALIDATION', METADATA_VALIDATION = 'METADATA_VALIDATION', CONTENT_VALIDATION = 'CONTENT_VALIDATION', COVER_VALIDATION = 'COVER_VALIDATION', PACKAGE_PREPARATION = 'PACKAGE_PREPARATION', READY_FOR_MANUAL_SUBMISSION = 'READY_FOR_MANUAL_SUBMISSION', MANUAL_SUBMISSION_RECORDED = 'MANUAL_SUBMISSION_RECORDED', IN_REVIEW = 'IN_REVIEW', PUBLISHED = 'PUBLISHED', ACTION_REQUIRED = 'ACTION_REQUIRED', REJECTED = 'REJECTED', BLOCKED = 'BLOCKED' }
export enum Draft2DigitalStatus { DRAFT = 'DRAFT', READY_FOR_SUBMISSION = 'READY_FOR_SUBMISSION', SUBMISSION_RECORDED = 'SUBMISSION_RECORDED', IN_REVIEW = 'IN_REVIEW', LIVE = 'LIVE', ACTION_REQUIRED = 'ACTION_REQUIRED', BLOCKED = 'BLOCKED', REJECTED = 'REJECTED', UNKNOWN = 'UNKNOWN' }
export enum Draft2DigitalChecklistStatus { NOT_STARTED = 'NOT_STARTED', IN_PROGRESS = 'IN_PROGRESS', COMPLETED = 'COMPLETED' }

@Schema({ _id: false })
export class Draft2DigitalChecklistItem {
  @Prop({ required: true, min: 1 }) sequence: number;
  @Prop({ required: true }) category: string;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) description: string;
  @Prop({ required: true }) required: boolean;
  @Prop({ type: String, enum: Draft2DigitalChecklistStatus, required: true }) completionStatus: Draft2DigitalChecklistStatus;
  @Prop({ type: String, default: null }) sourceApcField: string | null;
  @Prop({ type: String, default: null }) mappedValue: string | null;
  @Prop({ required: true }) validationStatus: string;
  @Prop({ type: String, default: null }) warning: string | null;
}
export const Draft2DigitalChecklistItemSchema = SchemaFactory.createForClass(Draft2DigitalChecklistItem);

@Schema({ _id: false })
export class Draft2DigitalStatusHistoryItem {
  @Prop({ type: String, enum: Draft2DigitalStatus, required: true }) status: Draft2DigitalStatus;
  @Prop({ required: true }) statusMessage: string;
  @Prop({ type: Date, required: true }) recordedAt: Date;
  @Prop({ type: String, default: null }) recordedBy: string | null;
}
export const Draft2DigitalStatusHistoryItemSchema = SchemaFactory.createForClass(Draft2DigitalStatusHistoryItem);
export type Draft2DigitalPackageDocument = HydratedDocument<Draft2DigitalPackage>;

@Schema({ collection: 'draft2digital_packages', timestamps: true, versionKey: 'version' })
export class Draft2DigitalPackage {
  @Prop({ required: true, unique: true, index: true }) packageId: string;
  @Prop({ required: true, index: true }) workflowId: string;
  @Prop({ required: true, index: true }) targetExecutionId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) manuscriptVersion: string;
  @Prop({ type: String, enum: Draft2DigitalProviderKey, required: true, index: true }) providerKey: Draft2DigitalProviderKey;
  @Prop({ type: String, enum: Draft2DigitalIntegrationMode, required: true }) integrationMode: Draft2DigitalIntegrationMode;
  @Prop({ type: String, enum: Draft2DigitalFormat, required: true, index: true }) d2dFormat: Draft2DigitalFormat;
  @Prop({ type: Object, required: true }) metadataSnapshot: Record<string, unknown>;
  @Prop({ type: Object, required: true }) pricingSnapshot: Record<string, unknown>;
  @Prop({ type: [Object], default: [] }) artifactReferences: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) coverReferences: Record<string, unknown>[];
  @Prop({ required: true, index: true }) submissionFingerprint: string;
  @Prop({ required: true, min: 1, index: true }) packageVersion: number;
  @Prop({ required: true }) checklistVersion: string;
  @Prop({ type: [Draft2DigitalChecklistItemSchema], default: [] }) checklist: Draft2DigitalChecklistItem[];
  @Prop({ type: String, enum: Draft2DigitalChecklistStatus, required: true }) checklistStatus: Draft2DigitalChecklistStatus;
  @Prop({ type: String, enum: Draft2DigitalStatus, required: true, index: true }) status: Draft2DigitalStatus;
  @Prop({ type: String, default: null, index: true }) externalTitleId: string | null;
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
  @Prop({ type: [Draft2DigitalStatusHistoryItemSchema], default: [] }) statusHistory: Draft2DigitalStatusHistoryItem[];
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
export const Draft2DigitalPackageSchema = SchemaFactory.createForClass(Draft2DigitalPackage);
Draft2DigitalPackageSchema.index({ projectId: 1, createdAt: -1 });
Draft2DigitalPackageSchema.index({ targetExecutionId: 1, packageVersion: -1 });
Draft2DigitalPackageSchema.index({ submissionFingerprint: 1, d2dFormat: 1, isDeleted: 1 });
Draft2DigitalPackageSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });
