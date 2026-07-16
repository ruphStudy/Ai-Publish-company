import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';

export enum JobExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'job_executions' })
export class JobExecution extends Document {
  @Prop({ type: Types.ObjectId, ref: 'SchedulerJob', required: true, index: true })
  jobId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 200, index: true })
  jobName: string;

  @Prop({ type: String, enum: DataSourceProvider, required: true, index: true })
  provider: DataSourceProvider;

  @Prop({
    type: String,
    enum: JobExecutionStatus,
    default: JobExecutionStatus.PENDING,
    index: true,
  })
  status: JobExecutionStatus;

  @Prop({ required: true })
  startedAt: Date;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;

  @Prop({ type: Number, default: null, min: 0 })
  durationMs: number | null;

  @Prop({ type: Number, default: 1, min: 1 })
  attempt: number;

  @Prop({ type: String, trim: true, maxlength: 2000, default: null })
  error: string | null;

  @Prop({ type: String, trim: true, maxlength: 5000, default: null })
  errorStack: string | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  result: Record<string, unknown> | null;

  @Prop({ type: String, trim: true, maxlength: 200, default: null })
  queueJobId: string | null;

  @Prop({ type: MongooseSchema.Types.Mixed, default: null })
  metadata: Record<string, unknown> | null;

  createdAt: Date;
  updatedAt: Date;
}

export const JobExecutionSchema = SchemaFactory.createForClass(JobExecution);

JobExecutionSchema.index({ jobId: 1, status: 1 });
JobExecutionSchema.index({ jobId: 1, createdAt: -1 });
JobExecutionSchema.index({ provider: 1, status: 1 });
JobExecutionSchema.index({ status: 1, createdAt: -1 });
JobExecutionSchema.index({ createdAt: -1 });
JobExecutionSchema.index({ queueJobId: 1 }, { sparse: true });
JobExecutionSchema.index(
  { jobId: 1, status: 1, createdAt: -1 },
  { name: 'idx_job_executions_job_status_created' },
);
