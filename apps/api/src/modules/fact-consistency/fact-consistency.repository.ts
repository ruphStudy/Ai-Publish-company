import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { FactConsistency, FactConsistencyDocument, FactConsistencyTargetType } from './entities/fact-consistency.entity';
export interface PaginatedFactConsistencyResult { items: FactConsistencyDocument[]; total: number; page: number; limit: number; totalPages: number }
@Injectable()
export class FactConsistencyRepository {
  constructor(@InjectModel(FactConsistency.name) private readonly model: Model<FactConsistency>) {}
  create(data: Partial<FactConsistency>): Promise<FactConsistencyDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<FactConsistency>): Promise<FactConsistencyDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<FactConsistencyDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<FactConsistencyDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByTarget(targetType: FactConsistencyTargetType, targetId: string): Promise<FactConsistencyDocument[]> { return this.model.find({ targetType, targetId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByManuscriptVersion(projectId: string, manuscriptVersion: string): Promise<FactConsistencyDocument[]> { return this.model.find({ projectId, manuscriptVersion, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  latestValidation(projectId: string): Promise<FactConsistencyDocument | null> { return this.model.findOne({ projectId, isDeleted: false }).sort({ validationVersion: -1 }).exec(); }
  findIdentical(targetType: FactConsistencyTargetType, targetId: string, manuscriptVersion: string): Promise<FactConsistencyDocument | null> { return this.model.findOne({ targetType, targetId, manuscriptVersion, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<FactConsistency>, page: number, limit: number): Promise<PaginatedFactConsistencyResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<FactConsistency>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
