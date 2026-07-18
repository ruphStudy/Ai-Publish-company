import { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';

@Schema({
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'trend_history',
})
export class TrendHistory extends Document {
  @Prop({ type: Types.ObjectId, ref: 'MarketKnowledge', required: true, index: true })
  knowledgeRecordId: Types.ObjectId;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({ required: true, trim: true, maxlength: 500 })
  externalId: string;

  @Prop({ type: Date, required: true, index: true })
  snapshotDate: Date;

  @Prop({ required: true, trim: true, maxlength: 50, index: true })
  snapshotVersion: string;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  trendScore: number | null;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  opportunityScore: number | null;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  demandScore: number | null;

  @Prop({ type: Number, default: null, min: 0, max: 100 })
  competitionScore: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  searchVolume: number | null;

  @Prop({ type: Number, default: null, min: 0, max: 5 })
  rating: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  reviewCount: number | null;

  @Prop({ type: Number, default: null, min: 0 })
  price: number | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  classification: Record<string, unknown> | null;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;

  createdAt: Date;
}

export const TrendHistorySchema = SchemaFactory.createForClass(TrendHistory);

TrendHistorySchema.index(
  { knowledgeRecordId: 1, snapshotDate: -1, isDeleted: 1 },
  { name: 'idx_trend_history_record_snapshot_date' },
);
TrendHistorySchema.index({ provider: 1, externalId: 1, snapshotDate: -1 });
TrendHistorySchema.index({ trendScore: -1, snapshotDate: -1 });
TrendHistorySchema.index({ opportunityScore: -1, snapshotDate: -1 });
TrendHistorySchema.index({ createdAt: -1 });
TrendHistorySchema.index(
  { knowledgeRecordId: 1, snapshotDate: 1, snapshotVersion: 1 },
  { unique: true, name: 'idx_trend_history_snapshot_unique' },
);

TrendHistorySchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {

  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  next();
});