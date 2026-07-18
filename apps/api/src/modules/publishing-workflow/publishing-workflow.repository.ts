import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PublishingScope, PublishingWorkflow, PublishingWorkflowDocument, PublishingWorkflowStatus } from './entities/publishing-workflow.entity';
export interface PaginatedPublishingWorkflowResult { items: PublishingWorkflowDocument[]; total: number; page: number; limit: number; totalPages: number }
@Injectable()
export class PublishingWorkflowRepository {
  constructor(@InjectModel(PublishingWorkflow.name) private readonly model: Model<PublishingWorkflow>) {}
  create(data: Partial<PublishingWorkflow>): Promise<PublishingWorkflowDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PublishingWorkflow>): Promise<PublishingWorkflowDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<PublishingWorkflowDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<PublishingWorkflowDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: PublishingWorkflowStatus): Promise<PublishingWorkflowDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByManuscriptVersion(projectId: string, manuscriptVersion: string): Promise<PublishingWorkflowDocument[]> { return this.model.find({ projectId, manuscriptVersion, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<PublishingWorkflowDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  findActiveWorkflow(projectId: string, manuscriptVersion: string, publicationScope: PublishingScope, submissionFingerprint: string, policyVersion: string): Promise<PublishingWorkflowDocument | null> { return this.model.findOne({ projectId, manuscriptVersion, publicationScope, submissionFingerprint, policyVersion, isDeleted: false, status: { $nin: [PublishingWorkflowStatus.COMPLETED, PublishingWorkflowStatus.FAILED, PublishingWorkflowStatus.CANCELLED, PublishingWorkflowStatus.SUPERSEDED] } }).exec(); }
  findLatestWorkflow(projectId: string, manuscriptVersion?: string): Promise<PublishingWorkflowDocument | null> { return this.model.findOne({ projectId, ...(manuscriptVersion ? { manuscriptVersion } : {}), isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  async search(filter: FilterQuery<PublishingWorkflow>, page: number, limit: number): Promise<PaginatedPublishingWorkflowResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublishingWorkflow>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
