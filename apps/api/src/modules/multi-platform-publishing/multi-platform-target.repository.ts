import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { MultiPlatformTarget, MultiPlatformTargetDocument } from './entities/multi-platform-target.entity';
import { MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';
@Injectable()
export class MultiPlatformTargetRepository {
  constructor(@InjectModel(MultiPlatformTarget.name) private readonly model: Model<MultiPlatformTarget>) {}
  create(data: Partial<MultiPlatformTarget>): Promise<MultiPlatformTargetDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<MultiPlatformTarget>): Promise<MultiPlatformTargetDocument | null> { return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<MultiPlatformTargetDocument | null> { return this.model.findById(id).exec(); }
  findByOrchestrationId(orchestrationId: string): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ orchestrationId }).sort({ priority: 1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ providerKey }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: MultiPlatformTargetStatus): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ status }).sort({ createdAt: -1 }).exec(); }
  findEligibleForExecution(orchestrationId: string): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ orchestrationId, status: { $in: [MultiPlatformTargetStatus.READY, MultiPlatformTargetStatus.QUEUED, MultiPlatformTargetStatus.RETRY_PENDING] } }).sort({ priority: 1 }).exec(); }
  findBlockedTargets(orchestrationId: string): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ orchestrationId, status: MultiPlatformTargetStatus.BLOCKED }).exec(); }
  findRetryableTargets(orchestrationId: string): Promise<MultiPlatformTargetDocument[]> { return this.model.find({ orchestrationId, status: { $in: [MultiPlatformTargetStatus.FAILED, MultiPlatformTargetStatus.RETRY_PENDING] } }).exec(); }
  async search(filter: FilterQuery<MultiPlatformTarget>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<MultiPlatformTarget>, page: number, limit: number) { return this.search(filter, page, limit); }
}
