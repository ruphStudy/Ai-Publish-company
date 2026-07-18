import type { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export enum DataSourceProvider {
  AMAZON_KDP = 'amazon_kdp',
  GOOGLE_TRENDS = 'google_trends',
  GOOGLE_BOOKS = 'google_books',
  OPEN_LIBRARY = 'open_library',
  MANUAL = 'manual',
}

export enum MarketDataType {
  BOOK_OPPORTUNITY = 'book_opportunity',
  MARKET_TREND = 'market_trend',
  GENRE_ANALYSIS = 'genre_analysis',
  KEYWORD_DATA = 'keyword_data',
  PRICING_DATA = 'pricing_data',
  COMPETITIVE_ANALYSIS = 'competitive_analysis',
}

export enum MarketIntelligenceStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  FAILED = 'failed',
}

@Schema({ timestamps: true, collection: 'market_intelligence' })
export class MarketIntelligence extends Document {
  @Prop({ required: true, trim: true, minlength: 2, maxlength: 300, index: true })
  title: string;

  @Prop({ required: true, lowercase: true, trim: true, match: /^[a-z0-9-]+$/, maxlength: 320 })
  slug: string;

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  description: string | null;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  source: DataSourceProvider;

  @Prop({ type: String, enum: MarketDataType, required: true, index: true })
  dataType: MarketDataType;

  @Prop({
    type: String,
    enum: MarketIntelligenceStatus,
    default: MarketIntelligenceStatus.PENDING,
    index: true,
  })
  status: MarketIntelligenceStatus;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  rawData: Record<string, unknown> | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  normalizedData: Record<string, unknown> | null;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  opportunityScore: number | null;

  @Prop({ type: String, trim: true, maxlength: 100, default: null })
  genre: string | null;

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: String, trim: true, maxlength: 10, default: null, index: true })
  language: string | null;

  @Prop({ type: String, trim: true, maxlength: 100, default: null, index: true })
  market: string | null;

  @Prop({ type: Date, default: null })
  periodStart: Date | null;

  @Prop({ type: Date, default: null })
  periodEnd: Date | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  providerMetadata: Record<string, unknown> | null;

  @Prop({ type: String, trim: true, maxlength: 1000, default: null })
  processingError: string | null;

  @Prop({ type: Date, default: null })
  lastProcessedAt: Date | null;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const MarketIntelligenceSchema = SchemaFactory.createForClass(MarketIntelligence);

MarketIntelligenceSchema.index({ slug: 1 }, { unique: true });
MarketIntelligenceSchema.index({ source: 1, dataType: 1 });
MarketIntelligenceSchema.index({ source: 1, status: 1, isDeleted: 1 });
MarketIntelligenceSchema.index({ status: 1, isDeleted: 1 });
MarketIntelligenceSchema.index({ language: 1, market: 1 });
MarketIntelligenceSchema.index({ opportunityScore: -1 });
MarketIntelligenceSchema.index({ createdAt: -1 });
MarketIntelligenceSchema.index({ lastProcessedAt: -1 });
MarketIntelligenceSchema.index(
  { title: 'text', description: 'text', genre: 'text', keywords: 'text' },
  { name: 'idx_market_intelligence_text_search' },
);

MarketIntelligenceSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {
  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

MarketIntelligenceSchema.path('slug').validate(
  (value: string) => /^[a-z0-9-]+$/.test(value),
  'Slug must contain only lowercase letters, numbers, and hyphens',
);
