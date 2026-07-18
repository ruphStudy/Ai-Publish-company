import { Query } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
} from '../models/monitoring.model';

@Schema({ timestamps: { createdAt: true, updatedAt: true }, collection: 'monitoring_executions' })
export class MonitoringExecution extends Document {
  @Prop({ required: true, unique: true, trim: true, index: true })
  executionId: string;

  @Prop({ required: true, trim: true, maxlength: 200, index: true })
  jobName: string;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({
    type: String,
    enum: MonitoringExecutionStatus,
    required: true,
    default: MonitoringExecutionStatus.PENDING,
    index: true,
  })
  status: MonitoringExecutionStatus;

  @Prop({ type: Date, required: true, index: true })
  startTime: Date;

  @Prop({ type: Date, default: null })
  endTime: Date | null;

  @Prop({ type: Number, default: null, min: 0 })
  duration: number | null;

  @Prop({ type: Number, default: 0, min: 0 })
  processedRecords: number;

  @Prop({ type: Number, default: 0, min: 0 })
  failedRecords: number;

  @Prop({ type: Number, default: 0, min: 0 })
  skippedRecords: number;

  @Prop({ type: Number, default: 0, min: 0 })
  retryCount: number;

  @Prop({ type: String, trim: true, maxlength: 5000, default: null })
  errorMessage: string | null;

  @Prop({
    type: String,
    enum: MonitoringExecutionType,
    required: true,
    index: true,
  })
  executionType: MonitoringExecutionType;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  triggeredBy: Types.ObjectId | null;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  deletedBy: Types.ObjectId | null;

  createdAt: Date;
  updatedAt: Date;
}

export const MonitoringExecutionSchema =
  SchemaFactory.createForClass(MonitoringExecution);

MonitoringExecutionSchema.index({ jobName: 1, status: 1, isDeleted: 1 });
MonitoringExecutionSchema.index({ provider: 1, startTime: -1 });
MonitoringExecutionSchema.index({ status: 1, createdAt: -1 });
MonitoringExecutionSchema.index({ executionType: 1, createdAt: -1 });

MonitoringExecutionSchema.pre(/^find/, function (this: Query<unknown, unknown>, next) {

  if (!this.getOptions()?.includeDeleted) {
    this.where({ isDeleted: { $ne: true } });
  }

  next();
});