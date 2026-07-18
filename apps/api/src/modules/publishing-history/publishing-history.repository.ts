import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { PublishingHistory, PublishingHistoryDocument } from './entities/publishing-history.entity';

@Injectable()
export class PublishingHistoryRepository {
  constructor(@InjectModel(PublishingHistory.name) private readonly model: Model<PublishingHistory>) {}
  create(data: Partial<PublishingHistory>): Promise<PublishingHistoryDocument> { return this.model.create(data); }
  findById(id: string): Promise<PublishingHistoryDocument | null> { return this.model.findById(id).exec(); }
  findByProjectId(projectId: string): Promise<PublishingHistoryDocument[]> { return this.model.find({ projectId }).sort({ timestamp: -1 }).exec(); }
  findByWorkflowId(workflowId: string): Promise<PublishingHistoryDocument[]> { return this.model.find({ workflowId }).sort({ timestamp: -1 }).exec(); }
  findByOrchestrationId(orchestrationId: string): Promise<PublishingHistoryDocument[]> { return this.model.find({ orchestrationId }).sort({ timestamp: -1 }).exec(); }
  findByTargetExecutionId(targetExecutionId: string): Promise<PublishingHistoryDocument[]> { return this.model.find({ targetExecutionId }).sort({ timestamp: -1 }).exec(); }
  async search(filter: FilterQuery<PublishingHistory>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublishingHistory>, page: number, limit: number) { return this.search(filter, page, limit); }
}
