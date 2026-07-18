import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PlagiarismDetection, PlagiarismDetectionDocument, PlagiarismTargetType } from './entities/plagiarism-detection.entity';
export interface PaginatedDetectionResult { items: PlagiarismDetectionDocument[]; total: number; page: number; limit: number; totalPages: number }
@Injectable()
export class PlagiarismDetectionRepository {
  constructor(@InjectModel(PlagiarismDetection.name) private readonly model: Model<PlagiarismDetection>) {}
  create(data: Partial<PlagiarismDetection>): Promise<PlagiarismDetectionDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PlagiarismDetection>): Promise<PlagiarismDetectionDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<PlagiarismDetectionDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<PlagiarismDetectionDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByTarget(targetType: PlagiarismTargetType, targetId: string): Promise<PlagiarismDetectionDocument[]> { return this.model.find({ targetType, targetId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  latestDetection(projectId: string): Promise<PlagiarismDetectionDocument | null> { return this.model.findOne({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findIdentical(targetType: PlagiarismTargetType, targetId: string, manuscriptVersion: string): Promise<PlagiarismDetectionDocument | null> { return this.model.findOne({ targetType, targetId, manuscriptVersion, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<PlagiarismDetection>, page: number, limit: number): Promise<PaginatedDetectionResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PlagiarismDetection>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).setOptions({ includeDeleted: true }).exec(); }
}
