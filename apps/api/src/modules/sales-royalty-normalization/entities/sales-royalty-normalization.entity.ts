import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum NormalizationScope { SALES = 'SALES', ROYALTY = 'ROYALTY', BOTH = 'BOTH' }
export enum NormalizationMode { SINGLE_RECORD = 'SINGLE_RECORD', SINGLE_IMPORT = 'SINGLE_IMPORT', PROJECT = 'PROJECT', PROVIDER = 'PROVIDER', DATE_RANGE = 'DATE_RANGE', BATCH = 'BATCH', REPROCESS = 'REPROCESS', HISTORICAL_BACKFILL = 'HISTORICAL_BACKFILL' }
export enum NormalizationStatus { PENDING = 'PENDING', VALIDATING = 'VALIDATING', NORMALIZING = 'NORMALIZING', PARTIALLY_NORMALIZED = 'PARTIALLY_NORMALIZED', NORMALIZED = 'NORMALIZED', MAPPING_REQUIRED = 'MAPPING_REQUIRED', CONFLICTED = 'CONFLICTED', RETRY_PENDING = 'RETRY_PENDING', FAILED = 'FAILED', CANCELLED = 'CANCELLED', SUPERSEDED = 'SUPERSEDED' }
export enum NormalizationRecordStatus { PENDING = 'PENDING', VALID = 'VALID', INVALID = 'INVALID', NORMALIZED = 'NORMALIZED', SKIPPED = 'SKIPPED', DUPLICATE = 'DUPLICATE', MAPPING_REQUIRED = 'MAPPING_REQUIRED', CONFLICTED = 'CONFLICTED', FAILED = 'FAILED' }
export enum CanonicalFormat { EBOOK = 'EBOOK', PAPERBACK = 'PAPERBACK', HARDCOVER = 'HARDCOVER', AUDIOBOOK = 'AUDIOBOOK', LARGE_PRINT = 'LARGE_PRINT', BUNDLE = 'BUNDLE', SUBSCRIPTION = 'SUBSCRIPTION', UNKNOWN = 'UNKNOWN' }
export enum CanonicalTransactionType { SALE = 'SALE', REFUND = 'REFUND', RETURN = 'RETURN', CANCELLATION = 'CANCELLATION', PROMOTIONAL = 'PROMOTIONAL', FREE = 'FREE', SUBSCRIPTION_READ = 'SUBSCRIPTION_READ', PAGE_READ = 'PAGE_READ', ADJUSTMENT = 'ADJUSTMENT', CORRECTION = 'CORRECTION', UNKNOWN = 'UNKNOWN' }
export enum CanonicalRoyaltyType { ESTIMATED = 'ESTIMATED', ACCRUED = 'ACCRUED', FINAL = 'FINAL', PAID = 'PAID', ADJUSTMENT = 'ADJUSTMENT', CORRECTION = 'CORRECTION', WITHHELD = 'WITHHELD', REVERSAL = 'REVERSAL', UNKNOWN = 'UNKNOWN' }
export enum CanonicalPaymentStatus { NOT_APPLICABLE = 'NOT_APPLICABLE', ESTIMATED = 'ESTIMATED', PENDING = 'PENDING', SCHEDULED = 'SCHEDULED', PROCESSING = 'PROCESSING', PAID = 'PAID', PARTIALLY_PAID = 'PARTIALLY_PAID', WITHHELD = 'WITHHELD', REVERSED = 'REVERSED', FAILED = 'FAILED', UNKNOWN = 'UNKNOWN' }
export enum BookMatchStatus { MATCHED = 'MATCHED', NOT_FOUND = 'NOT_FOUND', AMBIGUOUS = 'AMBIGUOUS', CONFLICTED = 'CONFLICTED', MANUAL_MAPPING_REQUIRED = 'MANUAL_MAPPING_REQUIRED' }
export enum MissingMappingPolicy { FAIL_RECORD = 'FAIL_RECORD', SKIP_RECORD = 'SKIP_RECORD', MARK_MAPPING_REQUIRED = 'MARK_MAPPING_REQUIRED', USE_UNKNOWN_CANONICAL_VALUE = 'USE_UNKNOWN_CANONICAL_VALUE', REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW' }
export enum NormalizationConflictPolicy { BLOCK = 'BLOCK', KEEP_EXISTING = 'KEEP_EXISTING', REPLACE_IF_NEWER = 'REPLACE_IF_NEWER', REPLACE_IF_HIGHER_MAPPING_VERSION = 'REPLACE_IF_HIGHER_MAPPING_VERSION', REQUIRE_MANUAL_REVIEW = 'REQUIRE_MANUAL_REVIEW', RECORD_BOTH_AS_VERSIONED_RESULTS = 'RECORD_BOTH_AS_VERSIONED_RESULTS' }
export enum NormalizationEventType { NORMALIZATION_REQUESTED = 'NORMALIZATION_REQUESTED', NORMALIZATION_STARTED = 'NORMALIZATION_STARTED', SOURCE_RECORD_VALIDATED = 'SOURCE_RECORD_VALIDATED', MAPPING_PROFILE_RESOLVED = 'MAPPING_PROFILE_RESOLVED', DIMENSIONS_NORMALIZED = 'DIMENSIONS_NORMALIZED', BOOK_MATCHED = 'BOOK_MATCHED', BOOK_MAPPING_REQUIRED = 'BOOK_MAPPING_REQUIRED', EDITION_MATCHED = 'EDITION_MATCHED', EDITION_MAPPING_REQUIRED = 'EDITION_MAPPING_REQUIRED', MAPPING_REQUIRED = 'MAPPING_REQUIRED', NORMALIZATION_CONFLICT_DETECTED = 'NORMALIZATION_CONFLICT_DETECTED', DUPLICATE_CANONICAL_RECORD_DETECTED = 'DUPLICATE_CANONICAL_RECORD_DETECTED', SALES_RECORD_NORMALIZED = 'SALES_RECORD_NORMALIZED', ROYALTY_RECORD_NORMALIZED = 'ROYALTY_RECORD_NORMALIZED', NORMALIZATION_RECORD_FAILED = 'NORMALIZATION_RECORD_FAILED', NORMALIZATION_PARTIALLY_COMPLETED = 'NORMALIZATION_PARTIALLY_COMPLETED', NORMALIZATION_COMPLETED = 'NORMALIZATION_COMPLETED', NORMALIZATION_FAILED = 'NORMALIZATION_FAILED', REPROCESSING_STARTED = 'REPROCESSING_STARTED', NORMALIZED_RECORD_SUPERSEDED = 'NORMALIZED_RECORD_SUPERSEDED', REPROCESSING_COMPLETED = 'REPROCESSING_COMPLETED' }

export type NormalizationBatchDocument = HydratedDocument<NormalizationBatch>;

@Schema({ collection: 'normalization_batches', timestamps: true, versionKey: 'version' })
export class NormalizationBatch {
  @Prop({ required: true, unique: true, index: true }) normalizationBatchId: string;
  @Prop({ type: String, enum: NormalizationScope, required: true, index: true }) scope: NormalizationScope;
  @Prop({ type: String, enum: NormalizationMode, required: true, index: true }) mode: NormalizationMode;
  @Prop({ type: String, default: null, index: true }) projectId: string | null;
  @Prop({ type: String, default: null, index: true }) providerKey: string | null;
  @Prop({ type: [String], default: [], index: true }) importIds: string[];
  @Prop({ required: true, index: true }) mappingProfileId: string;
  @Prop({ required: true, index: true }) mappingProfileVersion: string;
  @Prop({ type: String, enum: NormalizationStatus, required: true, index: true }) status: NormalizationStatus;
  @Prop({ required: true, unique: true, index: true }) idempotencyKey: string;
  @Prop({ default: 0, min: 0 }) sourceRecordCount: number;
  @Prop({ default: 0, min: 0 }) normalizedCount: number;
  @Prop({ default: 0, min: 0 }) duplicateCount: number;
  @Prop({ default: 0, min: 0 }) skippedCount: number;
  @Prop({ default: 0, min: 0 }) mappingRequiredCount: number;
  @Prop({ default: 0, min: 0 }) conflictCount: number;
  @Prop({ default: 0, min: 0 }) failedCount: number;
  @Prop({ default: 0, min: 0 }) warningCount: number;
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, required: true }) startedAt: Date;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: String, default: null }) reprocessingReason: string | null;
  @Prop({ type: String, default: null }) previousBatchId: string | null;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ default: false, index: true }) isDeleted: boolean;
  @Prop({ type: Date, default: null }) deletedAt: Date | null;
  @Prop({ type: String, default: null }) deletedBy: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const NormalizationBatchSchema = SchemaFactory.createForClass(NormalizationBatch);
NormalizationBatchSchema.index({ projectId: 1, providerKey: 1, status: 1, isDeleted: 1 });
NormalizationBatchSchema.index({ importIds: 1, status: 1 });
NormalizationBatchSchema.pre(/^find/, function () { const query = this as unknown as { getFilter: () => Record<string, unknown>; where: (filter: Record<string, unknown>) => unknown }; if (query.getFilter().isDeleted === undefined) query.where({ isDeleted: false }); });

export type NormalizationResultDocument = HydratedDocument<NormalizationResult>;

@Schema({ collection: 'normalization_results', timestamps: true, versionKey: 'version' })
export class NormalizationResult {
  @Prop({ required: true, unique: true, index: true }) normalizationResultId: string;
  @Prop({ required: true, index: true }) normalizationBatchId: string;
  @Prop({ type: String, enum: NormalizationScope, required: true, index: true }) scope: NormalizationScope;
  @Prop({ required: true, index: true }) sourceImportId: string;
  @Prop({ required: true, index: true }) sourceRecordId: string;
  @Prop({ required: true, index: true }) sourceFingerprint: string;
  @Prop({ type: String, default: null, index: true }) canonicalRecordId: string | null;
  @Prop({ type: String, default: null, index: true }) canonicalFingerprint: string | null;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) mappingProfileId: string;
  @Prop({ required: true, index: true }) mappingProfileVersion: string;
  @Prop({ type: String, enum: NormalizationRecordStatus, required: true, index: true }) status: NormalizationRecordStatus;
  @Prop({ type: String, enum: BookMatchStatus, required: true }) bookMatchStatus: BookMatchStatus;
  @Prop({ type: String, enum: BookMatchStatus, required: true }) editionMatchStatus: BookMatchStatus;
  @Prop({ type: Object, default: {} }) mappingsApplied: Record<string, unknown>;
  @Prop({ type: [String], default: [] }) warnings: string[];
  @Prop({ type: [Object], default: [] }) errors: Record<string, unknown>[];
  @Prop({ type: [Object], default: [] }) conflicts: Record<string, unknown>[];
  @Prop({ default: 1, min: 1 }) attempt: number;
  @Prop({ type: Date, default: null }) normalizedAt: Date | null;
  @Prop({ type: String, default: null }) supersedesResultId: string | null;
  @Prop({ type: String, default: null }) supersededByResultId: string | null;
  @Prop({ type: Object, default: {} }) lineage: Record<string, unknown>;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const NormalizationResultSchema = SchemaFactory.createForClass(NormalizationResult);
NormalizationResultSchema.index({ sourceRecordId: 1, mappingProfileVersion: 1 });
NormalizationResultSchema.index({ canonicalFingerprint: 1, mappingProfileVersion: 1 });
