import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PublishingTargetStatus } from './entities/publishing-workflow.entity';
import { PublishingTargetExecution, PublishingTargetExecutionDocument } from './entities/publishing-target-execution.entity';
@Injectable()
export class PublishingTargetExecutionRepository {
  constructor(@InjectModel(PublishingTargetExecution.name) private readonly model: Model<PublishingTargetExecution>) {}
  create(data: Partial<PublishingTargetExecution>): Promise<PublishingTargetExecutionDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PublishingTargetExecution>): Promise<PublishingTargetExecutionDocument | null> { return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<PublishingTargetExecutionDocument | null> { return this.model.findById(id).exec(); }
  findByWorkflowId(workflowId: string): Promise<PublishingTargetExecutionDocument[]> { return this.model.find({ workflowId }).sort({ createdAt: 1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<PublishingTargetExecutionDocument[]> { return this.model.find({ providerKey }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: PublishingTargetStatus): Promise<PublishingTargetExecutionDocument[]> { return this.model.find({ status }).sort({ createdAt: -1 }).exec(); }
  findByExternalSubmissionId(externalSubmissionId: string): Promise<PublishingTargetExecutionDocument | null> { return this.model.findOne({ externalSubmissionId }).exec(); }
  async search(filter: FilterQuery<PublishingTargetExecution>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublishingTargetExecution>, page: number, limit: number) { return this.search(filter, page, limit); }
}
