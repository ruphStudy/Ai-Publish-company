import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublishingCapability, PublishingTargetStatus, PublishingTargetType } from './publishing-workflow.entity';

export type PublishingTargetExecutionDocument = HydratedDocument<PublishingTargetExecution>;
@Schema({ collection: 'publishing_target_executions', timestamps: true, versionKey: 'version' })
export class PublishingTargetExecution {
  @Prop({ type: String, required: true, unique: true, index: true }) targetExecutionId: string;
  @Prop({ type: String, required: true, index: true }) workflowId: string;
  @Prop({ type: String, required: true, index: true }) projectId: string;
  @Prop({ type: String, enum: PublishingTargetType, required: true, index: true }) targetType: PublishingTargetType;
  @Prop({ type: String, required: true, index: true }) targetKey: string;
  @Prop({ type: String, required: true, index: true }) providerKey: string;
  @Prop({ type: String, required: true }) configurationProfile: string;
  @Prop({ type: String, enum: PublishingTargetStatus, required: true, index: true }) status: PublishingTargetStatus;
  @Prop({ type: [String], enum: PublishingCapability, default: [] }) capabilities: PublishingCapability[];
  @Prop({ type: [String], default: [] }) requestedFormats: string[];
  @Prop({ type: String, default: null }) packageReference: string | null;
  @Prop({ type: String, default: null }) packageChecksum: string | null;
  @Prop({ type: String, required: true, index: true }) submissionFingerprint: string;
  @Prop({ type: String, required: true, index: true }) idempotencyKey: string;
  @Prop({ type: String, default: null, index: true }) externalSubmissionId: string | null;
  @Prop({ type: String, default: null }) externalPublicationId: string | null;
  @Prop({ type: Object, default: {} }) normalizedResponse: Record<string, unknown>;
  @Prop({ type: String, default: null }) providerStatus: string | null;
  @Prop({ type: String, default: null }) providerStatusMessage: string | null;
  @Prop({ type: Number, default: 0, min: 0 }) retryCount: number;
  @Prop({ type: Number, default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
  @Prop({ type: Date, default: null }) submittedAt: Date | null;
  @Prop({ type: Date, default: null }) publishedAt: Date | null;
  @Prop({ type: Date, default: null }) rejectedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: Object, default: null }) error: Record<string, unknown> | null;
}
export const PublishingTargetExecutionSchema = SchemaFactory.createForClass(PublishingTargetExecution);
PublishingTargetExecutionSchema.index({ workflowId: 1, status: 1 });
PublishingTargetExecutionSchema.index({ providerKey: 1, status: 1 });
