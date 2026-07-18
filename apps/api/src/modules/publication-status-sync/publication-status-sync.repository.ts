import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ProviderSyncStatus, PublicationStatusSync, PublicationStatusSyncDocument } from './entities/publication-status-sync.entity';

@Injectable()
export class PublicationStatusSyncRepository {
  constructor(@InjectModel(PublicationStatusSync.name) private readonly model: Model<PublicationStatusSync>) {}
  create(data: Partial<PublicationStatusSync>): Promise<PublicationStatusSyncDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PublicationStatusSync>): Promise<PublicationStatusSyncDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByTargetExecutionId(targetExecutionId: string): Promise<PublicationStatusSyncDocument[]> { return this.model.find({ targetExecutionId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findLatestByTarget(targetExecutionId: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOne({ targetExecutionId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findActiveSync(targetExecutionId: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOne({ targetExecutionId, isDeleted: false, syncStatus: { $in: [ProviderSyncStatus.QUEUED, ProviderSyncStatus.SYNCING] } }).exec(); }
  findByStatus(syncStatus: ProviderSyncStatus): Promise<PublicationStatusSyncDocument[]> { return this.model.find({ syncStatus, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findRetryable(now = new Date()): Promise<PublicationStatusSyncDocument[]> { return this.model.find({ syncStatus: ProviderSyncStatus.RETRY_PENDING, nextRetryAt: { $lte: now }, isDeleted: false }).sort({ nextRetryAt: 1 }).exec(); }
  findScheduled(now = new Date()): Promise<PublicationStatusSyncDocument[]> { return this.model.find({ syncStatus: ProviderSyncStatus.QUEUED, nextRetryAt: { $lte: now }, isDeleted: false }).sort({ nextRetryAt: 1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<PublicationStatusSyncDocument[]> { return this.model.find({ providerKey, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<PublicationStatusSync>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublicationStatusSync>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string): Promise<PublicationStatusSyncDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
