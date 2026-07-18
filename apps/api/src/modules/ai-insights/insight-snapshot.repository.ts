import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { InsightSnapshot, InsightSnapshotDocument } from './entities/ai-insight-snapshot.entity';
import { InsightScope } from './entities/ai-insight.entity';

@Injectable()
export class InsightSnapshotRepository {
  constructor(@InjectModel(InsightSnapshot.name) private readonly model: Model<InsightSnapshot>) {}
  create(data: Partial<InsightSnapshot>): Promise<InsightSnapshotDocument> { return this.model.create(data); }
  findCurrent(scope: InsightScope, entityId: string | null): Promise<InsightSnapshotDocument | null> { return this.model.findOne({ scope, entityId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findLatest(projectId: string | null, scope?: InsightScope): Promise<InsightSnapshotDocument | null> { return this.model.findOne({ projectId, ...(scope ? { scope } : {}), isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  async search(filter: FilterQuery<InsightSnapshot>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ generatedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<InsightSnapshot>, page: number, limit: number) { return this.search(filter, page, limit); }
}
