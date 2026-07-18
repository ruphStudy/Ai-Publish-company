import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MultiPlatformTargetStatus } from './multi-platform-publishing.entity';

export type MultiPlatformTargetDocument = HydratedDocument<MultiPlatformTarget>;
@Schema({ collection: 'multi_platform_publishing_targets', timestamps: true, versionKey: 'version' })
export class MultiPlatformTarget {
  @Prop({ required: true, unique: true, index: true }) targetId: string;
  @Prop({ required: true, index: true }) orchestrationId: string;
  @Prop({ type: String, default: null, index: true }) workflowId: string | null;
  @Prop({ type: String, default: null, index: true }) targetExecutionId: string | null;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ required: true }) providerFormat: string;
  @Prop({ required: true }) required: boolean;
  @Prop({ required: true, min: 1 }) priority: number;
  @Prop({ type: [String], default: [] }) dependencies: string[];
  @Prop({ type: String, enum: MultiPlatformTargetStatus, required: true, index: true }) status: MultiPlatformTargetStatus;
  @Prop({ type: String, default: null }) packageReference: string | null;
  @Prop({ type: String, default: null }) packageFingerprint: string | null;
  @Prop({ type: String, default: null }) checklistReference: string | null;
  @Prop({ type: String, default: null }) externalSubmissionId: string | null;
  @Prop({ type: String, default: null }) externalPublicationId: string | null;
  @Prop({ type: String, default: null }) providerStatus: string | null;
  @Prop({ type: String, default: null }) providerStatusMessage: string | null;
  @Prop({ type: [String], default: [] }) conflictFlags: string[];
  @Prop({ default: 0, min: 0 }) retryCount: number;
  @Prop({ default: 0, min: 0 }) maximumRetries: number;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) readyForManualSubmissionAt: Date | null;
  @Prop({ type: Date, default: null }) submittedAt: Date | null;
  @Prop({ type: Date, default: null }) publishedAt: Date | null;
  @Prop({ type: Date, default: null }) failedAt: Date | null;
  @Prop({ type: Date, default: null }) cancelledAt: Date | null;
  @Prop({ type: Object, default: null }) lastError: Record<string, unknown> | null;
}
export const MultiPlatformTargetSchema = SchemaFactory.createForClass(MultiPlatformTarget);
MultiPlatformTargetSchema.index({ orchestrationId: 1, status: 1 });
MultiPlatformTargetSchema.index({ providerKey: 1, status: 1 });
