import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model } from 'mongoose';
import { PublishingAudit, PublishingAuditDocument } from './entities/publishing-audit.entity';

@Injectable()
export class PublishingAuditRepository {
  constructor(@InjectModel(PublishingAudit.name) private readonly model: Model<PublishingAudit>) {}
  create(data: Partial<PublishingAudit>): Promise<PublishingAuditDocument> { return this.model.create(data); }
  findByEntity(entityType: string, entityId: string): Promise<PublishingAuditDocument[]> { return this.model.find({ entityType, entityId }).sort({ timestamp: -1 }).exec(); }
  async search(filter: FilterQuery<PublishingAudit>, page: number, limit: number) { const [items, total] = await Promise.all([this.model.find(filter).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<PublishingAudit>, page: number, limit: number) { return this.search(filter, page, limit); }
}
