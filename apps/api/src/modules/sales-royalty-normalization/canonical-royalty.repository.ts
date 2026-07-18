import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { CanonicalPaymentStatus } from './entities/sales-royalty-normalization.entity';
import { CanonicalRoyalty, CanonicalRoyaltyDocument } from './entities/canonical-royalty.entity';

@Injectable()
export class CanonicalRoyaltyRepository {
  constructor(@InjectModel(CanonicalRoyalty.name) private readonly model: Model<CanonicalRoyalty>) {}
  create(data: Partial<CanonicalRoyalty>): Promise<CanonicalRoyaltyDocument> { return this.model.create(data); }
  findById(id: string): Promise<CanonicalRoyaltyDocument | null> { return this.model.findById(id).exec(); }
  findByProjectId(projectId: string): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ projectId }).sort({ royaltyPeriodStart: -1 }).exec(); }
  findByBookId(bookId: string): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ bookId }).sort({ royaltyPeriodStart: -1 }).exec(); }
  findByEditionId(editionId: string): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ editionId }).sort({ royaltyPeriodStart: -1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ providerKey }).sort({ royaltyPeriodStart: -1 }).exec(); }
  findByRoyaltyPeriod(royaltyPeriodStart: Date, royaltyPeriodEnd: Date): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ royaltyPeriodStart, royaltyPeriodEnd }).exec(); }
  findByPaymentStatus(paymentStatus: CanonicalPaymentStatus): Promise<CanonicalRoyaltyDocument[]> { return this.model.find({ paymentStatus }).sort({ paymentDate: -1 }).exec(); }
  findByCanonicalFingerprint(canonicalFingerprint: string): Promise<CanonicalRoyaltyDocument | null> { return this.model.findOne({ canonicalFingerprint }).exec(); }
  async search(filter: FilterQuery<CanonicalRoyalty>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ royaltyPeriodStart: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<CanonicalRoyalty>, page: number, limit: number) { return this.search(filter, page, limit); }
}
