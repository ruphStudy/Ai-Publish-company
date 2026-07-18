import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { SalesImportJob, SalesImportJobDocument, SalesRecord, SalesRecordDocument } from './entities/sales-ingestion.entity';

@Injectable()
export class SalesImportRepository {
  constructor(@InjectModel(SalesRecord.name) private readonly salesModel: Model<SalesRecord>, @InjectModel(SalesImportJob.name) private readonly jobModel: Model<SalesImportJob>) {}
  create(data: Partial<SalesRecord>): Promise<SalesRecordDocument> { return this.salesModel.create(data); }
  createJob(data: Partial<SalesImportJob>): Promise<SalesImportJobDocument> { return this.jobModel.create(data); }
  update(id: string, data: UpdateQuery<SalesImportJob>): Promise<SalesImportJobDocument | null> { return this.jobModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<SalesImportJobDocument | null> { return this.jobModel.findById(id).exec(); }
  findByImportId(importId: string): Promise<SalesImportJobDocument | null> { return this.jobModel.findOne({ importId }).exec(); }
  findByImportFingerprint(importFingerprint: string): Promise<SalesImportJobDocument | null> { return this.jobModel.findOne({ importFingerprint }).exec(); }
  findByProvider(providerKey: string): Promise<SalesImportJobDocument[]> { return this.jobModel.find({ providerKey }).sort({ createdAt: -1 }).exec(); }
  findByBook(bookId: string): Promise<SalesRecordDocument[]> { return this.salesModel.find({ bookId }).sort({ saleDate: -1 }).exec(); }
  findRecordByFingerprint(importFingerprint: string): Promise<SalesRecordDocument | null> { return this.salesModel.findOne({ importFingerprint }).exec(); }
  async search(filter: FilterQuery<SalesImportJob>, page: number, limit: number) { const [items, total] = await Promise.all([this.jobModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.jobModel.countDocuments(filter).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<SalesImportJob>, page: number, limit: number) { return this.search(filter, page, limit); }
}
