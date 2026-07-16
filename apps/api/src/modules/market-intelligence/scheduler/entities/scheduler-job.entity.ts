import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';

@Schema({ timestamps: true, collection: 'scheduler_jobs' })
export class SchedulerJob extends Document {
  @Prop({ required: true, unique: true, trim: true, minlength: 2, maxlength: 200, index: true })
  name: string;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  description: string | null;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({ type: String, enum: MarketDataType, default: null })
  dataType: MarketDataType | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  params: Record<string, unknown>;

  @Prop({ type: Number, default: null, min: 1000 })
  intervalMs: number | null;

  @Prop({ default: true, index: true })
  isEnabled: boolean;

  @Prop({ type: Number, default: 3, min: 0, max: 10 })
  maxRetries: number;

  @Prop({ type: Number, default: 5000, min: 1000 })
  retryDelayMs: number;

  @Prop({ type: Number, default: 30000, min: 1000 })
  timeoutMs: number;

  @Prop({ type: Date, default: null })
  lastExecutedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastSucceededAt: Date | null;

  @Prop({ type: Date, default: null })
  lastFailedAt: Date | null;

  @Prop({ type: Number, default: 0, min: 0 })
  executionCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  successCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  failureCount: number;

  @Prop({ type: Number, default: 0, min: 0 })
  consecutiveFailures: number;

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

export const SchedulerJobSchema = SchemaFactory.createForClass(SchedulerJob);

SchedulerJobSchema.index({ name: 1 }, { unique: true });
SchedulerJobSchema.index({ provider: 1, isEnabled: 1 });
SchedulerJobSchema.index({ isEnabled: 1, isDeleted: 1 });
SchedulerJobSchema.index({ lastExecutedAt: -1 });
SchedulerJobSchema.index({ consecutiveFailures: -1 });

SchedulerJobSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});
