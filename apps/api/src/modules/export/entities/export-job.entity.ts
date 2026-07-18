import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type {
  ExportArtifact} from './export-artifact.entity';
import {
  ExportArtifactSchema,
  ExportFormat,
} from './export-artifact.entity';

export enum ExportJobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export type ExportJobDocument = HydratedDocument<ExportJob>;

@Schema({
  collection: 'export_jobs',
  timestamps: true,
  versionKey: 'version',
})
export class ExportJob {
  @Prop({ required: true, unique: true, index: true })
  exportJobId: string;

  @Prop({ required: true, index: true })
  projectId: string;

  @Prop({ required: true, trim: true })
  exportType: string;

  @Prop({ type: [String], enum: ExportFormat, required: true })
  formats: ExportFormat[];

  @Prop({ required: true, enum: ExportJobStatus, index: true })
  status: ExportJobStatus;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop({ min: 0 })
  duration?: number;

  @Prop({ type: [ExportArtifactSchema], default: [] })
  generatedFiles: ExportArtifact[];

  @Prop()
  checksum?: string;

  @Prop({ default: 0, min: 0 })
  totalFileSize: number;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop()
  errorMessage?: string;

  @Prop()
  createdBy?: string;

  @Prop({ default: false, index: true })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  @Prop({ default: null })
  deletedBy?: string;

  createdAt: Date;

  updatedAt: Date;
}

export const ExportJobSchema = SchemaFactory.createForClass(ExportJob);

ExportJobSchema.index({ projectId: 1, createdAt: -1 });
ExportJobSchema.pre(/^find/, function () {
  const query = this as unknown as {
    getFilter: () => Record<string, unknown>;
    where: (filter: Record<string, unknown>) => unknown;
  };
  if (query.getFilter().isDeleted === undefined) {
    query.where({ isDeleted: false });
  }
});
