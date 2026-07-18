import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { NormalizationBatch, NormalizationBatchDocument, NormalizationResult, NormalizationResultDocument, NormalizationRecordStatus, NormalizationStatus } from './entities/sales-royalty-normalization.entity';

@Injectable()
export class NormalizationBatchRepository {
  constructor(@InjectModel(NormalizationBatch.name) private readonly model: Model<NormalizationBatch>) {}
  create(data: Partial<NormalizationBatch>): Promise<NormalizationBatchDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<NormalizationBatch>): Promise<NormalizationBatchDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<NormalizationBatchDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<NormalizationBatchDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<NormalizationBatchDocument[]> { return this.model.find({ providerKey, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: NormalizationStatus): Promise<NormalizationBatchDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByImportId(importId: string): Promise<NormalizationBatchDocument[]> { return this.model.find({ importIds: importId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<NormalizationBatchDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  findLatestByProject(projectId: string): Promise<NormalizationBatchDocument | null> { return this.model.findOne({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  async search(filter: FilterQuery<NormalizationBatch>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<NormalizationBatch>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}

@Injectable()
export class NormalizationResultRepository {
  constructor(@InjectModel(NormalizationResult.name) private readonly model: Model<NormalizationResult>) {}
  create(data: Partial<NormalizationResult>): Promise<NormalizationResultDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<NormalizationResult>): Promise<NormalizationResultDocument | null> { return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<NormalizationResultDocument | null> { return this.model.findById(id).exec(); }
  findByBatchId(normalizationBatchId: string): Promise<NormalizationResultDocument[]> { return this.model.find({ normalizationBatchId }).sort({ createdAt: 1 }).exec(); }
  findBySourceRecordId(sourceRecordId: string): Promise<NormalizationResultDocument | null> { return this.model.findOne({ sourceRecordId }).sort({ createdAt: -1 }).exec(); }
  findBySourceFingerprint(sourceFingerprint: string): Promise<NormalizationResultDocument | null> { return this.model.findOne({ sourceFingerprint }).sort({ createdAt: -1 }).exec(); }
  findByCanonicalFingerprint(canonicalFingerprint: string): Promise<NormalizationResultDocument | null> { return this.model.findOne({ canonicalFingerprint }).sort({ createdAt: -1 }).exec(); }
  findByStatus(status: NormalizationRecordStatus): Promise<NormalizationResultDocument[]> { return this.model.find({ status }).sort({ createdAt: -1 }).exec(); }
  findMappingRequired(): Promise<NormalizationResultDocument[]> { return this.findByStatus(NormalizationRecordStatus.MAPPING_REQUIRED); }
  findConflicted(): Promise<NormalizationResultDocument[]> { return this.findByStatus(NormalizationRecordStatus.CONFLICTED); }
  findFailed(): Promise<NormalizationResultDocument[]> { return this.findByStatus(NormalizationRecordStatus.FAILED); }
  async search(filter: FilterQuery<NormalizationResult>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<NormalizationResult>, page: number, limit: number) { return this.search(filter, page, limit); }
}
