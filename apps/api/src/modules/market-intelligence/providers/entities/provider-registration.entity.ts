import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderStatus } from '../interfaces/provider.interface';

@Schema({ timestamps: true, collection: 'provider_registrations' })
export class ProviderRegistration extends Document {
  @Prop({ required: true, unique: true, trim: true, minlength: 2, maxlength: 200, index: true })
  key: string;

  @Prop({ required: true, trim: true, minlength: 2, maxlength: 200 })
  name: string;

  @Prop({ required: true, trim: true, maxlength: 50 })
  version: string;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({
    type: String,
    enum: ProviderStatus,
    default: ProviderStatus.INACTIVE,
    index: true,
  })
  status: ProviderStatus;

  @Prop({ type: Number, default: 5, min: 1, max: 100 })
  priority: number;

  @Prop({ default: false, index: true })
  isEnabled: boolean;

  @Prop({ type: Number, default: 30000, min: 1000 })
  timeoutMs: number;

  @Prop({ type: Number, default: 3, min: 0, max: 10 })
  maxRetries: number;

  @Prop({ type: Number, default: 5000, min: 1000 })
  retryDelayMs: number;

  @Prop({ type: Number, default: null })
  rateLimitRpm: number | null;

  @Prop({ type: Number, default: null })
  rateLimitRpd: number | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: {} })
  customConfig: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  lastHealthCheckAt: Date | null;

  @Prop({ type: Boolean, default: null })
  lastHealthStatus: boolean | null;

  @Prop({ type: Number, default: null })
  lastHealthLatencyMs: number | null;

  @Prop({ type: String, trim: true, maxlength: 500, default: null })
  lastHealthError: string | null;

  @Prop({ default: false })
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

export const ProviderRegistrationSchema = SchemaFactory.createForClass(ProviderRegistration);

ProviderRegistrationSchema.index({ key: 1 }, { unique: true });
ProviderRegistrationSchema.index({ provider: 1, isEnabled: 1 });
ProviderRegistrationSchema.index({ status: 1, isEnabled: 1 });
ProviderRegistrationSchema.index({ priority: 1 });
ProviderRegistrationSchema.index({ isEnabled: 1, isDeleted: 1 });

ProviderRegistrationSchema.pre(/^find/, function (next) {
  const query = this as any;
  if (!query.getOptions()?.includeDeleted) {
    query.where({ isDeleted: { $ne: true } });
  }
  next();
});
