import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { NormalizedPublicationStatus, PublicationStatusSource, PublicationSyncTriggerType } from './publication-status-sync.entity';

export type PublicationStatusHistoryDocument = HydratedDocument<PublicationStatusHistory>;

@Schema({ collection: 'publication_status_history', timestamps: true, versionKey: 'version' })
export class PublicationStatusHistory {
  @Prop({ required: true, unique: true, index: true }) historyId: string;
  @Prop({ required: true, index: true }) targetExecutionId: string;
  @Prop({ type: String, default: null, index: true }) workflowId: string | null;
  @Prop({ type: String, default: null, index: true }) orchestrationId: string | null;
  @Prop({ required: true, index: true }) projectId: string;
  @Prop({ required: true, index: true }) providerKey: string;
  @Prop({ type: String, default: null, index: true }) externalSubmissionId: string | null;
  @Prop({ type: String, default: null, index: true }) externalPublicationId: string | null;
  @Prop({ type: String, enum: NormalizedPublicationStatus, default: null }) previousStatus: NormalizedPublicationStatus | null;
  @Prop({ type: String, enum: NormalizedPublicationStatus, required: true, index: true }) status: NormalizedPublicationStatus;
  @Prop({ type: String, default: null }) rawProviderStatus: string | null;
  @Prop({ type: String, default: null }) statusMessage: string | null;
  @Prop({ type: String, enum: PublicationStatusSource, required: true, index: true }) source: PublicationStatusSource;
  @Prop({ type: String, enum: PublicationSyncTriggerType, required: true }) triggerType: PublicationSyncTriggerType;
  @Prop({ type: Date, default: null, index: true }) providerUpdatedAt: Date | null;
  @Prop({ type: Date, required: true, index: true }) recordedAt: Date;
  @Prop({ type: String, default: null }) recordedBy: string | null;
  @Prop({ required: true, index: true }) responseFingerprint: string;
  @Prop({ type: String, default: null }) publicationUrl: string | null;
  @Prop({ type: Object, default: null }) actionRequiredDetails: Record<string, unknown> | null;
  @Prop({ type: Object, default: null }) rejectionDetails: Record<string, unknown> | null;
  @Prop({ default: false }) stale: boolean;
  @Prop({ default: true }) applied: boolean;
  @Prop({ type: String, default: null, index: true }) conflictId: string | null;
  @Prop({ type: String, default: null }) correctionReason: string | null;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const PublicationStatusHistorySchema = SchemaFactory.createForClass(PublicationStatusHistory);
PublicationStatusHistorySchema.index({ targetExecutionId: 1, recordedAt: -1 });
PublicationStatusHistorySchema.index({ workflowId: 1, recordedAt: -1 });
PublicationStatusHistorySchema.index({ orchestrationId: 1, recordedAt: -1 });
PublicationStatusHistorySchema.index({ projectId: 1, status: 1, recordedAt: -1 });
PublicationStatusHistorySchema.index({ targetExecutionId: 1, responseFingerprint: 1 }, { unique: true });
