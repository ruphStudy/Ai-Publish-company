import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { RoyaltyImportJob, RoyaltyImportJobDocument, RoyaltyRecord, RoyaltyRecordDocument } from './entities/royalty-ingestion.entity';

@Injectable()
export class RoyaltyImportRepository {
  constructor(@InjectModel(RoyaltyRecord.name) private readonly royaltyModel: Model<RoyaltyRecord>, @InjectModel(RoyaltyImportJob.name) private readonly jobModel: Model<RoyaltyImportJob>) {}
  create(data: Partial<RoyaltyRecord>): Promise<RoyaltyRecordDocument> { return this.royaltyModel.create(data); }
  createJob(data: Partial<RoyaltyImportJob>): Promise<RoyaltyImportJobDocument> { return this.jobModel.create(data); }
  update(id: string, data: UpdateQuery<RoyaltyImportJob>): Promise<RoyaltyImportJobDocument | null> { return this.jobModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<RoyaltyImportJobDocument | null> { return this.jobModel.findById(id).exec(); }
  findByImportId(importId: string): Promise<RoyaltyImportJobDocument | null> { return this.jobModel.findOne({ importId }).exec(); }
  findByImportFingerprint(importFingerprint: string): Promise<RoyaltyImportJobDocument | null> { return this.jobModel.findOne({ importFingerprint }).exec(); }
  findByProvider(providerKey: string): Promise<RoyaltyImportJobDocument[]> { return this.jobModel.find({ providerKey }).sort({ createdAt: -1 }).exec(); }
  findByBook(bookId: string): Promise<RoyaltyRecordDocument[]> { return this.royaltyModel.find({ bookId }).sort({ royaltyPeriod: -1 }).exec(); }
  findRecordByFingerprint(importFingerprint: string): Promise<RoyaltyRecordDocument | null> { return this.royaltyModel.findOne({ importFingerprint }).exec(); }
  async search(filter: FilterQuery<RoyaltyImportJob>, page: number, limit: number) { const [items, total] = await Promise.all([this.jobModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.jobModel.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<RoyaltyImportJob>, page: number, limit: number) { return this.search(filter, page, limit); }
}
