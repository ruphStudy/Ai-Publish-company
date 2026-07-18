import type { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublishingStepStatus, PublishingStepType } from './publishing-workflow.entity';

export type PublishingWorkflowStepDocument = HydratedDocument<PublishingWorkflowStep>;
@Schema({ collection: 'publishing_workflow_steps', timestamps: true, versionKey: 'version' })
export class PublishingWorkflowStep {
  @Prop({ type: String, required: true, unique: true, index: true }) stepId: string;
  @Prop({ type: String, required: true, index: true }) workflowId: string;
  @Prop({ type: String, default: null, index: true }) targetExecutionId: string | null;
  @Prop({ type: String, enum: PublishingStepType, required: true, index: true }) stepType: PublishingStepType;
  @Prop({ type: Number, required: true, min: 1 }) sequence: number;
  @Prop({ type: String, enum: PublishingStepStatus, required: true, index: true }) status: PublishingStepStatus;
  @Prop({ type: Number, required: true, min: 1 }) attempt: number;
  @Prop({ type: Date, default: null }) startedAt: Date | null;
  @Prop({ type: Date, default: null }) completedAt: Date | null;
  @Prop({ type: Number, default: 0, min: 0 }) duration: number;
  @Prop({ type: Object, default: {} }) inputReferences: Record<string, unknown>;
  @Prop({ type: Object, default: {} }) outputReferences: Record<string, unknown>;
  @Prop({ type: Object, default: null }) error: Record<string, unknown> | null;
  @Prop({ type: Boolean, default: false }) retryable: boolean;
  @Prop({ type: Date, default: null }) nextRetryAt: Date | null;
}
export const PublishingWorkflowStepSchema = SchemaFactory.createForClass(PublishingWorkflowStep);
PublishingWorkflowStepSchema.index({ workflowId: 1, sequence: 1 });
PublishingWorkflowStepSchema.index({ targetExecutionId: 1, status: 1 });
