import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { UnifiedTrendDirection } from '../../data-normalizer/models/unified-market-intelligence.model';

@Schema({ timestamps: true, collection: 'market_knowledge' })
export class MarketKnowledge extends Document {
  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({ required: true, trim: true, maxlength: 500 })
  externalId: string;

  @Prop({ required: true, trim: true, minlength: 1, maxlength: 500, index: true })
  title: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  subtitle: string | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null, index: true })
  author: string | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null, index: true })
  category: string | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null, index: true })
  subCategory: string | null;

  @Prop({ type: String, trim: true, maxlength: 10000, default: null })
  description: string | null;

  @Prop({ type: [String], default: [], index: true })
  keywords: string[];

  @Prop({ type: String, trim: true, maxlength: 10, default: null, index: true })
  language: string | null;

  @Prop({ type: Number, default: null, min: 0 })
  price: number | null;

  @Prop({ type: String, trim: true, uppercase: true, maxlength: 3, default: null })
  currency: string | null;

  @Prop({ type: Number, default: null, min: 0, max: 5 })
  rating: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  reviewCount: number | null;

  @Prop({ type: Number, default: null, min: 0, max: 100, index: true })
  trendScore: number | null;

  @Prop({ type: String, enum: UnifiedTrendDirection, default: null })
  trendDirection: UnifiedTrendDirection | null;

  @Prop({ type: Number, default: null, min: 0, index: true })
  searchVolume: number | null;

  @Prop({ type: Date, default: null, index: true })
  publishDate: Date | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  publisher: string | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  format: string | null;

  @Prop({ type: String, trim: true, maxlength: 2048, default: null })
  sourceUrl: string | null;

  @Prop({ type: String, trim: true, maxlength: 2048, default: null })
  coverImage: string | null;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: Date, required: true, index: true })
  collectedAt: Date;

  @Prop({ type: Date, required: true })
  lastNormalizedAt: Date;

  @Prop({ type: Number, required: true, default: 1, min: 1 })
  dataVersion: number;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const MarketKnowledgeSchema = SchemaFactory.createForClass(MarketKnowledge);

MarketKnowledgeSchema.index(
  { provider: 1, externalId: 1 },
  { unique: true, name: 'idx_market_knowledge_provider_external_id_unique' },
);
MarketKnowledgeSchema.index({ provider: 1, isDeleted: 1 });
MarketKnowledgeSchema.index({ category: 1, subCategory: 1, isDeleted: 1 });
MarketKnowledgeSchema.index({ language: 1, isDeleted: 1 });
MarketKnowledgeSchema.index({ trendScore: -1, isDeleted: 1 });
MarketKnowledgeSchema.index({ searchVolume: -1, isDeleted: 1 });
MarketKnowledgeSchema.index({ rating: -1, isDeleted: 1 });
MarketKnowledgeSchema.index({ price: 1, isDeleted: 1 });
MarketKnowledgeSchema.index({ publishDate: -1, isDeleted: 1 });
MarketKnowledgeSchema.index({ collectedAt: -1, isDeleted: 1 });
MarketKnowledgeSchema.index({ updatedAt: -1, isDeleted: 1 });
MarketKnowledgeSchema.index(
  { title: 'text', author: 'text', category: 'text', subCategory: 'text', keywords: 'text' },
  { name: 'idx_market_knowledge_text_search' },
);

MarketKnowledgeSchema.pre(/^find/, function (next) {
  const query = this as any;

  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }

  next();
});