import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum RoyaltyImportSource { PROVIDER_API = 'PROVIDER_API', CSV = 'CSV', EXCEL = 'EXCEL', MANUAL_ENTRY = 'MANUAL_ENTRY', SCHEDULED_SYNC = 'SCHEDULED_SYNC', FUTURE_PROVIDER = 'FUTURE_PROVIDER' }
export enum RoyaltyImportTrigger { MANUAL = 'MANUAL', SCHEDULED = 'SCHEDULED', INCREMENTAL = 'INCREMENTAL', FULL_SYNC = 'FULL_SYNC', RETRY = 'RETRY', ADMIN = 'ADMIN' }
export enum RoyaltyImportStatus { PENDING = 'PENDING', VALIDATING = 'VALIDATING', IMPORTING = 'IMPORTING', COMPLETED = 'COMPLETED', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', FAILED = 'FAILED', RETRY_PENDING = 'RETRY_PENDING', CANCELLED = 'CANCELLED' }
export enum RoyaltyProviderCapability { API_IMPORT = 'API_IMPORT', CSV_IMPORT = 'CSV_IMPORT', XLSX_IMPORT = 'XLSX_IMPORT', MANUAL_IMPORT = 'MANUAL_IMPORT', INCREMENTAL_SYNC = 'INCREMENTAL_SYNC', FULL_SYNC = 'FULL_SYNC', ESTIMATED_ROYALTIES = 'ESTIMATED_ROYALTIES', FINAL_ROYALTIES = 'FINAL_ROYALTIES' }
export enum RoyaltyDuplicatePolicy { SKIP = 'SKIP', RECORD_ONLY = 'RECORD_ONLY', REPLACE = 'REPLACE', FAIL_IMPORT = 'FAIL_IMPORT' }
export enum RoyaltyPaymentStatus { PENDING = 'PENDING', ESTIMATED = 'ESTIMATED', FINALIZED = 'FINALIZED', PAID = 'PAID', WITHHELD = 'WITHHELD', ADJUSTED = 'ADJUSTED', CANCELLED = 'CANCELLED', UNKNOWN = 'UNKNOWN' }
export enum RoyaltyType { ESTIMATED = 'ESTIMATED', FINAL = 'FINAL', PAYMENT = 'PAYMENT', ADJUSTMENT = 'ADJUSTMENT', CORRECTION = 'CORRECTION' }
export enum RoyaltyIngestionEventType { IMPORT_STARTED = 'IMPORT_STARTED', IMPORT_COMPLETED = 'IMPORT_COMPLETED', IMPORT_FAILED = 'IMPORT_FAILED', ROYALTY_IMPORTED = 'ROYALTY_IMPORTED', DUPLICATE_DETECTED = 'DUPLICATE_DETECTED', PAYMENT_RECONCILED = 'PAYMENT_RECONCILED', SYNC_STARTED = 'SYNC_STARTED', SYNC_COMPLETED = 'SYNC_COMPLETED', SYNC_FAILED = 'SYNC_FAILED' }

export type RoyaltyRecordDocument = HydratedDocument<RoyaltyRecord>;

@Schema({ collection: 'royalty_records', timestamps: true, versionKey: 'version' })
export class RoyaltyRecord {
  @Prop({ required: true, unique: true, index: true }) royaltyRecordId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ required: true, index: true }) marketplace: string;
  @Prop({ required: true, index: true }) country: string;
  @Prop({ required: true, index: true }) currency: string;
  @Prop({ required: true }) timezone: string;
  @Prop({ required: true, index: true }) royaltyPeriod: string;
  @Prop({ type: Date, default: null, index: true }) paymentDate: Date | null;
  @Prop({ type: Date, required: true, index: true }) reportingDate: Date;
  @Prop({ type: String, enum: RoyaltyPaymentStatus, required: true, index: true }) paymentStatus: RoyaltyPaymentStatus;
  @Prop({ type: String, enum: RoyaltyType, required: true, index: true }) royaltyType: RoyaltyType;
  @Prop({ required: true }) estimated: boolean;
  @Prop({ required: true }) finalized: boolean;
  @Prop({ type: String, default: null, index: true }) bookId: string | null;
  @Prop({ type: String, default: null, index: true }) editionId: string | null;
  @Prop({ required: true, index: true }) format: string;
  @Prop({ default: 0, min: 0 }) unitsSold: number;
  @Prop({ default: 0 }) grossRevenue: number;
  @Prop({ default: 0 }) royaltyRate: number;
  @Prop({ required: true }) royaltyAmount: number;
  @Prop({ default: 0 }) taxAmount: number;
  @Prop({ default: 0 }) withholdingTax: number;
  @Prop({ required: true }) paymentAmount: number;
  @Prop({ type: String, default: null, index: true }) transactionId: string | null;
  @Prop({ type: String, default: null, index: true }) externalReference: string | null;
  @Prop({ type: Object, default: {} }) originalValues: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) normalizedValues: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, enum: RoyaltyImportSource, required: true, index: true }) source: RoyaltyImportSource;
  @Prop({ required: true, index: true }) importId: string;
  @Prop({ required: true, unique: true, index: true }) importFingerprint: string;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const RoyaltyRecordSchema = SchemaFactory.createForClass(RoyaltyRecord);
RoyaltyRecordSchema.index({ providerKey: 1, transactionId: 1, royaltyPeriod: 1 });
RoyaltyRecordSchema.index({ projectId: 1, royaltyPeriod: -1 });
RoyaltyRecordSchema.index({ bookId: 1, editionId: 1, paymentDate: -1 });

export type RoyaltyImportJobDocument = HydratedDocument<RoyaltyImportJob>;

@Schema({ collection: 'royalty_import_jobs', timestamps: true, versionKey: 'version' })
export class RoyaltyImportJob {
  @Prop({ required: true, unique: true, index: true }) importId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: RoyaltyImportSource, required: true, index: true }) source: RoyaltyImportSource;
  @Prop({ type: String, enum: RoyaltyImportTrigger, required: true, index: true }) trigger: RoyaltyImportTrigger;
  @Prop({ type: String, default: null }) fileName: string | null;
  @Prop({ type: String, default: null, index: true }) fileHash: string | null;
  @Prop({ required: true, unique: true, index: true }) importFingerprint: string;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: String, enum: RoyaltyImportStatus, required: true, index: true }) status: RoyaltyImportStatus;
  @Prop({ default: 0, min: 0 }) importedRecords: number;
  @Prop({ default: 0, min: 0 }) skippedRecords: number;
  @Prop({ default: 0, min: 0 }) duplicateRecords: number;
  @Prop({ default: 0, min: 0 }) failedRecords: number;
  @Prop({ type: [String], default: [] }) warnings: string[];
  @Prop({ type: [Object], default: [] }) errors: Record<string, unknown>[];
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const RoyaltyImportJobSchema = SchemaFactory.createForClass(RoyaltyImportJob);
RoyaltyImportJobSchema.index({ providerKey: 1, status: 1, createdAt: -1 });
RoyaltyImportJobSchema.index({ projectId: 1, createdAt: -1 });
