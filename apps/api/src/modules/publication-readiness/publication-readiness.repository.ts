import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { PublicationReadiness, PublicationReadinessDocument, ReadinessPolicyProfile, ReadinessTargetType } from './entities/publication-readiness.entity';
export interface PaginatedPublicationReadinessResult { items: PublicationReadinessDocument[]; total: number; page: number; limit: number; totalPages: number }
@Injectable()
export class PublicationReadinessRepository {
  constructor(@InjectModel(PublicationReadiness.name) private readonly model: Model<PublicationReadiness>) {}
  create(data: Partial<PublicationReadiness>): Promise<PublicationReadinessDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<PublicationReadiness>): Promise<PublicationReadinessDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<PublicationReadinessDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<PublicationReadinessDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ readinessVersion: -1 }).exec(); }
  findByTarget(targetType: ReadinessTargetType, targetId: string): Promise<PublicationReadinessDocument[]> { return this.model.find({ targetType, targetId, isDeleted: false }).sort({ readinessVersion: -1 }).exec(); }
  findByManuscriptVersion(projectId: string, manuscriptVersion: string): Promise<PublicationReadinessDocument[]> { return this.model.find({ projectId, manuscriptVersion, isDeleted: false }).sort({ readinessVersion: -1 }).exec(); }
  findByPolicyProfile(policyProfile: ReadinessPolicyProfile): Promise<PublicationReadinessDocument[]> { return this.model.find({ policyProfile, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  latestAssessment(projectId: string, manuscriptVersion?: string): Promise<PublicationReadinessDocument | null> { return this.model.findOne({ projectId, ...(manuscriptVersion ? { manuscriptVersion } : {}), isDeleted: false }).sort({ readinessVersion: -1 }).exec(); }
  findActiveAssessment(targetType: ReadinessTargetType, targetId: string, manuscriptVersion: string, policyVersion: string): Promise<PublicationReadinessDocument | null> { return this.model.findOne({ targetType, targetId, manuscriptVersion, policyVersion, isSuperseded: false, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<PublicationReadiness>, page: number, limit: number): Promise<PaginatedPublicationReadinessResult> { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ readinessVersion: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublicationReadiness>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
