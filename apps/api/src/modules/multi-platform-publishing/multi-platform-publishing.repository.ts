import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { MultiPlatformOrchestrationStatus, MultiPlatformPublishingOrchestration, MultiPlatformPublishingOrchestrationDocument } from './entities/multi-platform-publishing.entity';
@Injectable()
export class MultiPlatformPublishingRepository {
  constructor(@InjectModel(MultiPlatformPublishingOrchestration.name) private readonly model: Model<MultiPlatformPublishingOrchestration>) {}
  create(data: Partial<MultiPlatformPublishingOrchestration>): Promise<MultiPlatformPublishingOrchestrationDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<MultiPlatformPublishingOrchestration>): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<MultiPlatformPublishingOrchestrationDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: MultiPlatformOrchestrationStatus): Promise<MultiPlatformPublishingOrchestrationDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByManuscriptVersion(projectId: string, manuscriptVersion: string): Promise<MultiPlatformPublishingOrchestrationDocument[]> { return this.model.find({ projectId, manuscriptVersion, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  findByFingerprint(orchestrationFingerprint: string): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOne({ orchestrationFingerprint, isDeleted: false }).exec(); }
  findActiveOrchestration(projectId: string, manuscriptVersion: string, orchestrationFingerprint: string): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOne({ projectId, manuscriptVersion, orchestrationFingerprint, isDeleted: false, status: { $nin: [MultiPlatformOrchestrationStatus.COMPLETED, MultiPlatformOrchestrationStatus.FAILED, MultiPlatformOrchestrationStatus.CANCELLED, MultiPlatformOrchestrationStatus.SUPERSEDED] } }).exec(); }
  findLatestOrchestration(projectId: string, manuscriptVersion?: string): Promise<MultiPlatformPublishingOrchestrationDocument | null> { return this.model.findOne({ projectId, ...(manuscriptVersion ? { manuscriptVersion } : {}), isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  async search(filter: FilterQuery<MultiPlatformPublishingOrchestration>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<MultiPlatformPublishingOrchestration>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
