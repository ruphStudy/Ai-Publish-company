import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { AIInsight, AIInsightDocument, InsightCategory, InsightPriority, InsightScope } from './entities/ai-insight.entity';

@Injectable()
export class InsightRepository {
  constructor(@InjectModel(AIInsight.name) private readonly model: Model<AIInsight>) {}
  create(data: Partial<AIInsight>): Promise<AIInsightDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<AIInsight>): Promise<AIInsightDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<AIInsightDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProject(projectId: string): Promise<AIInsightDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByScope(scope: InsightScope): Promise<AIInsightDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByEntity(scope: InsightScope, entityId: string): Promise<AIInsightDocument[]> { return this.model.find({ scope, entityId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByCategory(category: InsightCategory): Promise<AIInsightDocument[]> { return this.model.find({ category, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByPriority(priority: InsightPriority): Promise<AIInsightDocument[]> { return this.model.find({ priority, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByFingerprint(fingerprint: string): Promise<AIInsightDocument | null> { return this.model.findOne({ fingerprint, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<AIInsight>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ generatedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<AIInsight>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
