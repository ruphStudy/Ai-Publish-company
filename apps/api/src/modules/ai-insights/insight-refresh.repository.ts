import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { InsightRefresh, InsightRefreshDocument } from './entities/ai-insight-refresh.entity';
import { InsightRefreshStatus, InsightScope } from './entities/ai-insight.entity';

@Injectable()
export class InsightRefreshRepository {
  constructor(@InjectModel(InsightRefresh.name) private readonly model: Model<InsightRefresh>) {}
  create(data: Partial<InsightRefresh>): Promise<InsightRefreshDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<InsightRefresh>): Promise<InsightRefreshDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<InsightRefreshDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findActive(projectId: string | null, scope: InsightScope): Promise<InsightRefreshDocument | null> { return this.model.findOne({ projectId, scope, status: { $in: [InsightRefreshStatus.PENDING, InsightRefreshStatus.QUEUED, InsightRefreshStatus.GENERATING] }, isDeleted: false }).exec(); }
  findRetryable(): Promise<InsightRefreshDocument[]> { return this.model.find({ status: InsightRefreshStatus.RETRY_PENDING, isDeleted: false }).sort({ startedAt: 1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<InsightRefreshDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<InsightRefresh>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
}
