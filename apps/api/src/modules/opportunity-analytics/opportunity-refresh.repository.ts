import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { OpportunityRefresh, OpportunityRefreshDocument } from './entities/opportunity-refresh.entity';
import { OpportunityRefreshStatus, OpportunityScope } from './entities/opportunity-analytics.entity';

@Injectable()
export class OpportunityRefreshRepository {
  constructor(@InjectModel(OpportunityRefresh.name) private readonly model: Model<OpportunityRefresh>) {}
  create(data: Partial<OpportunityRefresh>): Promise<OpportunityRefreshDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<OpportunityRefresh>): Promise<OpportunityRefreshDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<OpportunityRefreshDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<OpportunityRefreshDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByStatus(status: OpportunityRefreshStatus): Promise<OpportunityRefreshDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByScope(scope: OpportunityScope): Promise<OpportunityRefreshDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<OpportunityRefreshDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  findActiveRefresh(projectId: string | null, scope: OpportunityScope): Promise<OpportunityRefreshDocument | null> { return this.model.findOne({ projectId, scope, status: { $in: [OpportunityRefreshStatus.PENDING, OpportunityRefreshStatus.QUEUED, OpportunityRefreshStatus.ANALYZING] }, isDeleted: false }).exec(); }
  findRetryable(): Promise<OpportunityRefreshDocument[]> { return this.model.find({ status: OpportunityRefreshStatus.RETRY_PENDING, isDeleted: false }).sort({ startedAt: 1 }).exec(); }
  async search(filter: FilterQuery<OpportunityRefresh>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<OpportunityRefresh>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
