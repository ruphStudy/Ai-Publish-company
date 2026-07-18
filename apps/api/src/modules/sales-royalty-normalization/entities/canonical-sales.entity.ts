import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CanonicalFormat, CanonicalTransactionType, NormalizationRecordStatus } from './sales-royalty-normalization.entity';

export type CanonicalSalesDocument = HydratedDocument<CanonicalSales>;

@Schema({ collection: 'canonical_sales_records', timestamps: true, versionKey: 'version' })
export class CanonicalSales {
  @Prop({ required: true, unique: true, index: true }) canonicalSalesId: string;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ type: String, default: null, index: true }) bookId: string | null;
  @Prop({ type: String, default: null, index: true }) editionId: string | null;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ type: String, default: null, index: true }) providerAccountId: string | null;
  @Prop({ required: true, index: true }) marketplaceId: string;
  @Prop({ required: true, index: true }) countryCode: string;
  @Prop({ type: String, default: null, index: true }) territoryCode: string | null;
  @Prop({ required: true, index: true }) currencyCode: string;
  @Prop({ required: true }) transactionCurrencyCode: string;
  @Prop({ required: true }) timezone: string;
  @Prop({ type: String, enum: CanonicalTransactionType, required: true, index: true }) transactionType: CanonicalTransactionType;
  @Prop({ type: Date, required: true }) saleDate: Date;
  @Prop({ type: Date, required: true, index: true }) saleDateUtc: Date;
  @Prop({ type: Date, required: true }) reportingDate: Date;
  @Prop({ type: Date, required: true, index: true }) reportingDateUtc: Date;
  @Prop({ type: String, enum: CanonicalFormat, required: true, index: true }) format: CanonicalFormat;
  @Prop({ required: true, min: 0 }) quantity: number;
  @Prop({ required: true }) grossAmount: string;
  @Prop({ default: '0' }) discountAmount: string;
  @Prop({ default: '0' }) taxAmount: string;
  @Prop({ default: '0' }) refundAmount: string;
  @Prop({ required: true }) netAmount: string;
  @Prop({ type: String, default: null }) unitPrice: string | null;
  @Prop({ type: String, default: null }) exchangeRate: string | null;
  @Prop({ type: String, default: null }) baseCurrencyCode: string | null;
  @Prop({ type: String, default: null }) baseCurrencyGrossAmount: string | null;
  @Prop({ type: String, default: null }) baseCurrencyNetAmount: string | null;
  @Prop({ type: String, default: null, index: true }) providerTransactionId: string | null;
  @Prop({ type: String, default: null, index: true }) externalReference: string | null;
  @Prop({ required: true, index: true }) sourceImportId: string;
  @Prop({ required: true, index: true }) sourceRecordId: string;
  @Prop({ required: true, index: true }) sourceFingerprint: string;
  @Prop({ required: true, index: true }) canonicalFingerprint: string;
  @Prop({ required: true, index: true }) mappingProfileId: string;
  @Prop({ required: true, index: true }) mappingProfileVersion: string;
  @Prop({ type: Date, required: true }) normalizedAt: Date;
  @Prop({ type: String, enum: NormalizationRecordStatus, required: true }) normalizationStatus: NormalizationRecordStatus;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) lineage: Record<string, unknown>;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const CanonicalSalesSchema = SchemaFactory.createForClass(CanonicalSales);
CanonicalSalesSchema.index({ projectId: 1, saleDateUtc: -1 });
CanonicalSalesSchema.index({ bookId: 1, editionId: 1, saleDateUtc: -1 });
CanonicalSalesSchema.index({ providerKey: 1, canonicalFingerprint: 1 }, { unique: true });
