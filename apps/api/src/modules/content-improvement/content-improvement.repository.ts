import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ContentImprovement, ContentImprovementDocument, ImprovementTargetType } from './entities/content-improvement.entity';
import { ContentImprovementRepositoryInterface, PaginatedContentImprovementResult } from './interfaces/content-improvement.repository.interface';

@Injectable()
export class ContentImprovementRepository implements ContentImprovementRepositoryInterface {
  constructor(@InjectModel(ContentImprovement.name) private readonly model: Model<ContentImprovement>) {}
  create(data: Partial<ContentImprovement>): Promise<ContentImprovementDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<ContentImprovement>): Promise<ContentImprovementDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<ContentImprovementDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<ContentImprovementDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByTarget(targetType: ImprovementTargetType, targetId: string): Promise<ContentImprovementDocument[]> { return this.model.find({ targetType, targetId, isDeleted: false }).sort({ improvementVersion: -1 }).exec(); }
  findByQualityReviewId(qualityReviewId: string): Promise<ContentImprovementDocument[]> { return this.model.find({ qualityReviewId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findLatestByTarget(targetType: ImprovementTargetType, targetId: string): Promise<ContentImprovementDocument | null> { return this.model.findOne({ targetType, targetId, isDeleted: false }).sort({ improvementVersion: -1 }).exec(); }
  async search(filter: FilterQuery<ContentImprovement>, page: number, limit: number): Promise<PaginatedContentImprovementResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<ContentImprovement>, page: number, limit: number): Promise<PaginatedContentImprovementResult> { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string): Promise<ContentImprovementDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string): Promise<ContentImprovementDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).setOptions({ includeDeleted: true }).exec(); }
}
