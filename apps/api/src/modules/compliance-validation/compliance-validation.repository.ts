import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { ComplianceValidation, ComplianceValidationDocument, ComplianceValidationTargetType } from './entities/compliance-validation.entity';
export interface PaginatedComplianceValidationResult { items: ComplianceValidationDocument[]; total: number; page: number; limit: number; totalPages: number }
@Injectable()
export class ComplianceValidationRepository {
  constructor(@InjectModel(ComplianceValidation.name) private readonly model: Model<ComplianceValidation>) {}
  create(data: Partial<ComplianceValidation>): Promise<ComplianceValidationDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<ComplianceValidation>): Promise<ComplianceValidationDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<ComplianceValidationDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<ComplianceValidationDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByTarget(targetType: ComplianceValidationTargetType, targetId: string): Promise<ComplianceValidationDocument[]> { return this.model.find({ targetType, targetId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findByManuscriptVersion(projectId: string, manuscriptVersion: string): Promise<ComplianceValidationDocument[]> { return this.model.find({ projectId, manuscriptVersion, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  latestValidation(projectId: string): Promise<ComplianceValidationDocument | null> { return this.model.findOne({ projectId, isDeleted: false }).sort({ complianceVersion: -1 }).exec(); }
  findIdentical(targetType: ComplianceValidationTargetType, targetId: string, manuscriptVersion: string): Promise<ComplianceValidationDocument | null> { return this.model.findOne({ targetType, targetId, manuscriptVersion, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<ComplianceValidation>, page: number, limit: number): Promise<PaginatedComplianceValidationResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<ComplianceValidation>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
