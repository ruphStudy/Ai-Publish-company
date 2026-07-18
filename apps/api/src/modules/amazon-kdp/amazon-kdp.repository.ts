import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { AmazonKdpPackage, AmazonKdpPackageDocument, AmazonKdpStatus } from './entities/amazon-kdp.entity';
@Injectable()
export class AmazonKdpRepository {
  constructor(@InjectModel(AmazonKdpPackage.name) private readonly model: Model<AmazonKdpPackage>) {}
  create(data: Partial<AmazonKdpPackage>): Promise<AmazonKdpPackageDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<AmazonKdpPackage>): Promise<AmazonKdpPackageDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByTargetExecutionId(targetExecutionId: string): Promise<AmazonKdpPackageDocument[]> { return this.model.find({ targetExecutionId, isDeleted: false }).sort({ packageVersion: -1 }).exec(); }
  findByProjectId(projectId: string): Promise<AmazonKdpPackageDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findBySubmissionFingerprint(submissionFingerprint: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ submissionFingerprint, isDeleted: false }).sort({ packageVersion: -1 }).exec(); }
  findByAsin(asin: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ asin, isDeleted: false }).exec(); }
  findByIsbn(isbn: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ isbn, isDeleted: false }).exec(); }
  findByExternalTitleId(externalTitleId: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ externalTitleId, isDeleted: false }).exec(); }
  findByStatus(status: AmazonKdpStatus): Promise<AmazonKdpPackageDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findLatestPackage(targetExecutionId: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ targetExecutionId, isDeleted: false }).sort({ packageVersion: -1 }).exec(); }
  findActivePackage(targetExecutionId: string, submissionFingerprint: string): Promise<AmazonKdpPackageDocument | null> { return this.model.findOne({ targetExecutionId, submissionFingerprint, isDeleted: false, status: { $nin: [AmazonKdpStatus.REJECTED, AmazonKdpStatus.UNPUBLISHED] } }).sort({ packageVersion: -1 }).exec(); }
  async search(filter: FilterQuery<AmazonKdpPackage>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<AmazonKdpPackage>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
