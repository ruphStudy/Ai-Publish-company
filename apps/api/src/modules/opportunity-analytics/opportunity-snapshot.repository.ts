import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { OpportunitySnapshot, OpportunitySnapshotDocument } from './entities/opportunity-snapshot.entity';
import { OpportunityScope } from './entities/opportunity-analytics.entity';

@Injectable()
export class OpportunitySnapshotRepository {
  constructor(@InjectModel(OpportunitySnapshot.name) private readonly model: Model<OpportunitySnapshot>) {}
  create(data: Partial<OpportunitySnapshot>): Promise<OpportunitySnapshotDocument> { return this.model.create(data); }
  findById(id: string): Promise<OpportunitySnapshotDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findCurrent(scope: OpportunityScope, entityId: string | null): Promise<OpportunitySnapshotDocument | null> { return this.model.findOne({ scope, entityId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findLatest(projectId: string, scope?: OpportunityScope): Promise<OpportunitySnapshotDocument | null> { return this.model.findOne({ projectId, ...(scope ? { scope } : {}), isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByProjectId(projectId: string): Promise<OpportunitySnapshotDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByScope(scope: OpportunityScope): Promise<OpportunitySnapshotDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByEntity(scope: OpportunityScope, entityId: string): Promise<OpportunitySnapshotDocument[]> { return this.model.find({ scope, entityId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByFingerprint(fingerprint: string): Promise<OpportunitySnapshotDocument | null> { return this.model.findOne({ fingerprint, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<OpportunitySnapshot>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ generatedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<OpportunitySnapshot>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
