import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublishingWorkflowEventType } from './publishing-workflow.entity';

export type PublishingWorkflowEventDocument = HydratedDocument<PublishingWorkflowEvent>;
@Schema({ collection: 'publishing_workflow_events', timestamps: true, versionKey: 'version' })
export class PublishingWorkflowEvent {
  @Prop({ type: String, required: true, unique: true, index: true }) eventId: string;
  @Prop({ type: String, required: true, index: true }) workflowId: string;
  @Prop({ type: String, default: null, index: true }) targetExecutionId: string | null;
  @Prop({ type: String, enum: PublishingWorkflowEventType, required: true, index: true }) eventType: PublishingWorkflowEventType;
  @Prop({ type: String, required: true }) message: string;
  @Prop({ type: Object, default: {} }) metadata: Record<string, unknown>;
  @Prop({ type: String, default: null }) createdBy: string | null;
}
export const PublishingWorkflowEventSchema = SchemaFactory.createForClass(PublishingWorkflowEvent);
PublishingWorkflowEventSchema.index({ workflowId: 1, createdAt: -1 });
