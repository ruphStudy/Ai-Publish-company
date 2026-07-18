import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { CanonicalSales, CanonicalSalesDocument } from './entities/canonical-sales.entity';

@Injectable()
export class CanonicalSalesRepository {
  constructor(@InjectModel(CanonicalSales.name) private readonly model: Model<CanonicalSales>) {}
  create(data: Partial<CanonicalSales>): Promise<CanonicalSalesDocument> { return this.model.create(data); }
  findById(id: string): Promise<CanonicalSalesDocument | null> { return this.model.findById(id).exec(); }
  findByProjectId(projectId: string): Promise<CanonicalSalesDocument[]> { return this.model.find({ projectId }).sort({ saleDateUtc: -1 }).exec(); }
  findByBookId(bookId: string): Promise<CanonicalSalesDocument[]> { return this.model.find({ bookId }).sort({ saleDateUtc: -1 }).exec(); }
  findByEditionId(editionId: string): Promise<CanonicalSalesDocument[]> { return this.model.find({ editionId }).sort({ saleDateUtc: -1 }).exec(); }
  findByProviderKey(providerKey: string): Promise<CanonicalSalesDocument[]> { return this.model.find({ providerKey }).sort({ saleDateUtc: -1 }).exec(); }
  findByDateRange(from: Date, to: Date): Promise<CanonicalSalesDocument[]> { return this.model.find({ saleDateUtc: { $gte: from, $lte: to } }).sort({ saleDateUtc: -1 }).exec(); }
  findByCanonicalFingerprint(canonicalFingerprint: string): Promise<CanonicalSalesDocument | null> { return this.model.findOne({ canonicalFingerprint }).exec(); }
  async search(filter: FilterQuery<CanonicalSales>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ saleDateUtc: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<CanonicalSales>, page: number, limit: number) { return this.search(filter, page, limit); }
}
