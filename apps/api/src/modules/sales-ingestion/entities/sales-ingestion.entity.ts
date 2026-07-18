import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum SalesImportSource { PROVIDER_API = 'PROVIDER_API', CSV = 'CSV', EXCEL = 'EXCEL', MANUAL_ENTRY = 'MANUAL_ENTRY', SCHEDULED_SYNC = 'SCHEDULED_SYNC', FUTURE_PROVIDER = 'FUTURE_PROVIDER' }
export enum SalesImportTrigger { MANUAL = 'MANUAL', SCHEDULED = 'SCHEDULED', INCREMENTAL = 'INCREMENTAL', FULL_SYNC = 'FULL_SYNC', RETRY = 'RETRY', ADMIN = 'ADMIN' }
export enum SalesImportStatus { PENDING = 'PENDING', VALIDATING = 'VALIDATING', IMPORTING = 'IMPORTING', COMPLETED = 'COMPLETED', PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED', FAILED = 'FAILED', RETRY_PENDING = 'RETRY_PENDING', CANCELLED = 'CANCELLED' }
export enum SalesProviderCapability { API_IMPORT = 'API_IMPORT', CSV_IMPORT = 'CSV_IMPORT', XLSX_IMPORT = 'XLSX_IMPORT', MANUAL_IMPORT = 'MANUAL_IMPORT', INCREMENTAL_SYNC = 'INCREMENTAL_SYNC', FULL_SYNC = 'FULL_SYNC' }
export enum SalesDuplicatePolicy { SKIP = 'SKIP', RECORD_ONLY = 'RECORD_ONLY', REPLACE = 'REPLACE', FAIL_IMPORT = 'FAIL_IMPORT' }
export enum SalesIngestionEventType { IMPORT_STARTED = 'IMPORT_STARTED', IMPORT_COMPLETED = 'IMPORT_COMPLETED', IMPORT_FAILED = 'IMPORT_FAILED', RECORD_IMPORTED = 'RECORD_IMPORTED', RECORD_SKIPPED = 'RECORD_SKIPPED', DUPLICATE_DETECTED = 'DUPLICATE_DETECTED', SYNC_STARTED = 'SYNC_STARTED', SYNC_COMPLETED = 'SYNC_COMPLETED', SYNC_FAILED = 'SYNC_FAILED' }

export type SalesRecordDocument = HydratedDocument<SalesRecord>;

@Schema({ collection: 'sales_records', timestamps: true, versionKey: 'version' })
export class SalesRecord {
  @Prop({ required: true, unique: true, index: true }) salesRecordId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ required: true, index: true }) marketplace: string;
  @Prop({ required: true, index: true }) country: string;
  @Prop({ required: true, index: true }) currency: string;
  @Prop({ required: true }) timezone: string;
  @Prop({ type: Date, required: true, index: true }) saleDate: Date;
  @Prop({ type: Date, required: true, index: true }) reportingDate: Date;
  @Prop({ type: String, default: null, index: true }) bookId: string | null;
  @Prop({ type: String, default: null, index: true }) editionId: string | null;
  @Prop({ required: true, index: true }) format: string;
  @Prop({ required: true, min: 0 }) quantity: number;
  @Prop({ required: true }) grossAmount: number;
  @Prop({ required: true }) netAmount: number;
  @Prop({ default: 0 }) taxAmount: number;
  @Prop({ default: 0 }) discountAmount: number;
  @Prop({ type: String, default: null, index: true }) transactionId: string | null;
  @Prop({ type: String, default: null, index: true }) externalReference: string | null;
  @Prop({ type: Object, default: {} }) originalValues: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) normalizedValues: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, enum: SalesImportSource, required: true, index: true }) source: SalesImportSource;
  @Prop({ required: true, index: true }) importId: string;
  @Prop({ required: true, unique: true, index: true }) importFingerprint: string;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const SalesRecordSchema = SchemaFactory.createForClass(SalesRecord);
SalesRecordSchema.index({ providerKey: 1, transactionId: 1, saleDate: 1 });
SalesRecordSchema.index({ projectId: 1, saleDate: -1 });
SalesRecordSchema.index({ bookId: 1, editionId: 1, reportingDate: -1 });

export type SalesImportJobDocument = HydratedDocument<SalesImportJob>;

@Schema({ collection: 'sales_import_jobs', timestamps: true, versionKey: 'version' })
export class SalesImportJob {
  @Prop({ required: true, unique: true, index: true }) importId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, enum: SalesImportSource, required: true, index: true }) source: SalesImportSource;
  @Prop({ type: String, enum: SalesImportTrigger, required: true, index: true }) trigger: SalesImportTrigger;
  @Prop({ type: String, default: null }) fileName: string | null;
  @Prop({ type: String, default: null, index: true }) fileHash: string | null;
  @Prop({ required: true, unique: true, index: true }) importFingerprint: string;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: String, enum: SalesImportStatus, required: true, index: true }) status: SalesImportStatus;
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
export const SalesImportJobSchema = SchemaFactory.createForClass(SalesImportJob);
SalesImportJobSchema.index({ providerKey: 1, status: 1, createdAt: -1 });
SalesImportJobSchema.index({ projectId: 1, createdAt: -1 });
