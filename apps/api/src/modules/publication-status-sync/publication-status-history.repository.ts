import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { NormalizedPublicationStatus, PublicationStatusSource } from './entities/publication-status-sync.entity';
import { PublicationStatusHistory, PublicationStatusHistoryDocument } from './entities/publication-status-history.entity';

@Injectable()
export class PublicationStatusHistoryRepository {
  constructor(@InjectModel(PublicationStatusHistory.name) private readonly model: Model<PublicationStatusHistory>) {}
  create(data: Partial<PublicationStatusHistory>): Promise<PublicationStatusHistoryDocument> { return this.model.create(data); }
  findById(id: string): Promise<PublicationStatusHistoryDocument | null> { return this.model.findById(id).exec(); }
  findByTargetExecutionId(targetExecutionId: string): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ targetExecutionId }).sort({ recordedAt: -1 }).exec(); }
  findByWorkflowId(workflowId: string): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ workflowId }).sort({ recordedAt: -1 }).exec(); }
  findByOrchestrationId(orchestrationId: string): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ orchestrationId }).sort({ recordedAt: -1 }).exec(); }
  findByProjectId(projectId: string): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ projectId }).sort({ recordedAt: -1 }).exec(); }
  findLatestByTarget(targetExecutionId: string): Promise<PublicationStatusHistoryDocument | null> { return this.model.findOne({ targetExecutionId }).sort({ recordedAt: -1 }).exec(); }
  findByStatus(status: NormalizedPublicationStatus): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ status }).sort({ recordedAt: -1 }).exec(); }
  findBySource(source: PublicationStatusSource): Promise<PublicationStatusHistoryDocument[]> { return this.model.find({ source }).sort({ recordedAt: -1 }).exec(); }
  findByResponseFingerprint(targetExecutionId: string, responseFingerprint: string): Promise<PublicationStatusHistoryDocument | null> { return this.model.findOne({ targetExecutionId, responseFingerprint }).exec(); }
  async search(filter: FilterQuery<PublicationStatusHistory>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ recordedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublicationStatusHistory>, page: number, limit: number) { return this.search(filter, page, limit); }
}
