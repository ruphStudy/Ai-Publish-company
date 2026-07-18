import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model, UpdateQuery } from 'mongoose';
import { PublishingStepStatus } from './entities/publishing-workflow.entity';
import { PublishingWorkflowStep, PublishingWorkflowStepDocument } from './entities/publishing-workflow-step.entity';
@Injectable()
export class PublishingWorkflowStepRepository {
  constructor(@InjectModel(PublishingWorkflowStep.name) private readonly model: Model<PublishingWorkflowStep>) {}
  create(data: Partial<PublishingWorkflowStep>): Promise<PublishingWorkflowStepDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PublishingWorkflowStep>): Promise<PublishingWorkflowStepDocument | null> { return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findByWorkflowId(workflowId: string): Promise<PublishingWorkflowStepDocument[]> { return this.model.find({ workflowId }).sort({ sequence: 1, attempt: 1 }).exec(); }
  findByTargetExecutionId(targetExecutionId: string): Promise<PublishingWorkflowStepDocument[]> { return this.model.find({ targetExecutionId }).sort({ sequence: 1, attempt: 1 }).exec(); }
  findCurrentStep(workflowId: string): Promise<PublishingWorkflowStepDocument | null> { return this.model.findOne({ workflowId, status: PublishingStepStatus.RUNNING }).sort({ sequence: 1 }).exec(); }
  findFailedSteps(workflowId: string): Promise<PublishingWorkflowStepDocument[]> { return this.model.find({ workflowId, status: PublishingStepStatus.FAILED }).sort({ sequence: 1 }).exec(); }
}
