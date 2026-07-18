import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Opportunity, OpportunityDocument, OpportunityCategory, OpportunityPriority, OpportunityScope, OpportunityStatus, OpportunityType } from './entities/opportunity-analytics.entity';

@Injectable()
export class OpportunityRepository {
  constructor(@InjectModel(Opportunity.name) private readonly model: Model<Opportunity>) {}
  create(data: Partial<Opportunity>): Promise<OpportunityDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<Opportunity>): Promise<OpportunityDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<OpportunityDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<OpportunityDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByScope(scope: OpportunityScope): Promise<OpportunityDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByEntity(entityType: string, entityId: string): Promise<OpportunityDocument[]> { return this.model.find({ entityType, entityId, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByCategory(category: OpportunityCategory): Promise<OpportunityDocument[]> { return this.model.find({ category, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByType(opportunityType: OpportunityType): Promise<OpportunityDocument[]> { return this.model.find({ opportunityType, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByPriority(priority: OpportunityPriority): Promise<OpportunityDocument[]> { return this.model.find({ priority, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByStatus(status: OpportunityStatus): Promise<OpportunityDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<OpportunityDocument[]> { return this.model.find({ providerKey, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByMarketplaceId(marketplaceId: string): Promise<OpportunityDocument[]> { return this.model.find({ marketplaceId, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByCountryCode(countryCode: string): Promise<OpportunityDocument[]> { return this.model.find({ countryCode, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByFormat(format: string): Promise<OpportunityDocument[]> { return this.model.find({ format, isDeleted: false }).sort({ score: -1 }).exec(); }
  findByFingerprint(fingerprint: string): Promise<OpportunityDocument | null> { return this.model.findOne({ fingerprint, isDeleted: false }).exec(); }
  findActiveDuplicate(fingerprint: string): Promise<OpportunityDocument | null> { return this.model.findOne({ fingerprint, status: { $in: [OpportunityStatus.DETECTED, OpportunityStatus.ACTIVE, OpportunityStatus.ACCEPTED, OpportunityStatus.IN_PROGRESS, OpportunityStatus.SNOOZED] }, isDeleted: false }).exec(); }
  findExpiring(now = new Date()): Promise<OpportunityDocument[]> { return this.model.find({ expiresAt: { $lte: now }, isDeleted: false }).exec(); }
  findSnoozed(now = new Date()): Promise<OpportunityDocument[]> { return this.model.find({ snoozedUntil: { $gt: now }, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<Opportunity>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ score: -1, confidence: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<Opportunity>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
