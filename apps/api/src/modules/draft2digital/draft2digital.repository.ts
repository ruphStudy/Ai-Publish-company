import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { Draft2DigitalPackage, Draft2DigitalPackageDocument, Draft2DigitalStatus } from './entities/draft2digital.entity';
@Injectable()
export class Draft2DigitalRepository {
  constructor(@InjectModel(Draft2DigitalPackage.name) private readonly model: Model<Draft2DigitalPackage>) {}
  create(data: Partial<Draft2DigitalPackage>): Promise<Draft2DigitalPackageDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<Draft2DigitalPackage>): Promise<Draft2DigitalPackageDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<Draft2DigitalPackageDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<Draft2DigitalPackageDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  findLatestPackage(targetExecutionId: string): Promise<Draft2DigitalPackageDocument | null> { return this.model.findOne({ targetExecutionId, isDeleted: false }).sort({ packageVersion: -1 }).exec(); }
  findActivePackage(targetExecutionId: string, submissionFingerprint: string): Promise<Draft2DigitalPackageDocument | null> { return this.model.findOne({ targetExecutionId, submissionFingerprint, isDeleted: false, status: { $nin: [Draft2DigitalStatus.REJECTED] } }).sort({ packageVersion: -1 }).exec(); }
  findByStatus(status: Draft2DigitalStatus): Promise<Draft2DigitalPackageDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  async search(filter: FilterQuery<Draft2DigitalPackage>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<Draft2DigitalPackage>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
