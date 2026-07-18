import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { PublishingWorkflowEvent, PublishingWorkflowEventDocument } from './entities/publishing-workflow-event.entity';
@Injectable()
export class PublishingWorkflowEventRepository {
  constructor(@InjectModel(PublishingWorkflowEvent.name) private readonly model: Model<PublishingWorkflowEvent>) {}
  create(data: Partial<PublishingWorkflowEvent>): Promise<PublishingWorkflowEventDocument> { return this.model.create(data); }
  findByWorkflowId(workflowId: string): Promise<PublishingWorkflowEventDocument[]> { return this.model.find({ workflowId }).sort({ createdAt: -1 }).exec(); }
}
