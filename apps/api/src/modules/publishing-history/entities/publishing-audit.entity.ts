import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublishingHistorySource } from './publishing-history.entity';

export type PublishingAuditDocument = HydratedDocument<PublishingAudit>;

@Schema({ collection: 'publishing_audit_records', timestamps: true, versionKey: 'version' })
export class PublishingAudit {
  @Prop({ required: true, unique: true, index: true }) auditId: string;
  @Prop({ required: true, index: true }) entityType: string;
  @Prop({ required: true, index: true }) entityId: string;
  @Prop({ required: true, index: true }) action: string;
  @Prop({ type: Object, default: null }) before: Record<string, unknown> | null;
  @Prop({ type: Object, default: null }) after: Record<string, unknown> | null;
  @Prop({ type: String, default: null, index: true }) performedBy: string | null;
  @Prop({ type: String, enum: PublishingHistorySource, required: true, index: true }) source: PublishingHistorySource;
  @Prop({ type: String, default: null }) reason: string | null;
  @Prop({ type: Date, required: true, index: true }) timestamp: Date;
  @Prop({ type: String, default: null, index: true }) correlationId: string | null;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, default: null }) createdBy: string | null;
  @Prop({ type: String, default: null }) updatedBy: string | null;
}
export const PublishingAuditSchema = SchemaFactory.createForClass(PublishingAudit);
PublishingAuditSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });
PublishingAuditSchema.index({ performedBy: 1, timestamp: -1 });
PublishingAuditSchema.pre('findOneAndUpdate', function (next) { next(new Error('Publishing audit records are immutable and cannot be updated')); });
PublishingAuditSchema.pre('updateOne', function (next) { next(new Error('Publishing audit records are immutable and cannot be updated')); });
PublishingAuditSchema.pre('deleteOne', function (next) { next(new Error('Publishing audit records are immutable and cannot be deleted')); });
