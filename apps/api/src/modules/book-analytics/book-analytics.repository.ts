import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { AnalyticsRefresh, AnalyticsRefreshDocument, AnalyticsScope, AnalyticsSnapshot, AnalyticsSnapshotDocument, AnalyticsStatus } from './entities/book-analytics.entity';

@Injectable()
export class AnalyticsSnapshotRepository {
  constructor(@InjectModel(AnalyticsSnapshot.name) private readonly model: Model<AnalyticsSnapshot>) {}
  create(data: Partial<AnalyticsSnapshot>): Promise<AnalyticsSnapshotDocument> { return this.model.create(data); }
  findById(id: string): Promise<AnalyticsSnapshotDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findCurrent(scope: AnalyticsScope, entityId: string | null, reportingCurrency: string): Promise<AnalyticsSnapshotDocument | null> { return this.model.findOne({ scope, entityId, reportingCurrency, status: AnalyticsStatus.COMPLETED, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findLatest(projectId: string, scope?: AnalyticsScope): Promise<AnalyticsSnapshotDocument | null> { return this.model.findOne({ projectId, ...(scope ? { scope } : {}), isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByProjectId(projectId: string): Promise<AnalyticsSnapshotDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByScope(scope: AnalyticsScope): Promise<AnalyticsSnapshotDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByEntity(entityType: string, entityId: string): Promise<AnalyticsSnapshotDocument[]> { return this.model.find({ entityType, entityId, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByPeriod(periodStart: Date, periodEnd: Date): Promise<AnalyticsSnapshotDocument[]> { return this.model.find({ periodStart, periodEnd, isDeleted: false }).exec(); }
  findByReportingCurrency(reportingCurrency: string): Promise<AnalyticsSnapshotDocument[]> { return this.model.find({ reportingCurrency, isDeleted: false }).sort({ generatedAt: -1 }).exec(); }
  findByFingerprint(fingerprint: string): Promise<AnalyticsSnapshotDocument | null> { return this.model.findOne({ fingerprint, isDeleted: false }).exec(); }
  async search(filter: FilterQuery<AnalyticsSnapshot>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ generatedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<AnalyticsSnapshot>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}

@Injectable()
export class AnalyticsRefreshRepository {
  constructor(@InjectModel(AnalyticsRefresh.name) private readonly model: Model<AnalyticsRefresh>) {}
  create(data: Partial<AnalyticsRefresh>): Promise<AnalyticsRefreshDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<AnalyticsRefresh>): Promise<AnalyticsRefreshDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<AnalyticsRefreshDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<AnalyticsRefreshDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByStatus(status: AnalyticsStatus): Promise<AnalyticsRefreshDocument[]> { return this.model.find({ status, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByScope(scope: AnalyticsScope): Promise<AnalyticsRefreshDocument[]> { return this.model.find({ scope, isDeleted: false }).sort({ startedAt: -1 }).exec(); }
  findByIdempotencyKey(idempotencyKey: string): Promise<AnalyticsRefreshDocument | null> { return this.model.findOne({ idempotencyKey, isDeleted: false }).exec(); }
  findActiveRefresh(projectId: string | null, scope: AnalyticsScope): Promise<AnalyticsRefreshDocument | null> { return this.model.findOne({ projectId, scope, status: { $in: [AnalyticsStatus.PENDING, AnalyticsStatus.QUEUED, AnalyticsStatus.CALCULATING] }, isDeleted: false }).exec(); }
  findRetryable(): Promise<AnalyticsRefreshDocument[]> { return this.model.find({ status: AnalyticsStatus.RETRY_PENDING, isDeleted: false }).sort({ startedAt: 1 }).exec(); }
  async search(filter: FilterQuery<AnalyticsRefresh>, page: number, limit: number) { const query = { ...filter, isDeleted: false }; const [items, total] = await Promise.all([this.model.find(query).sort({ startedAt: -1 }).skip((page - 1) * limit).limit(limit).exec(), this.model.countDocuments(query).exec()]); return { items, total, page, limit, totalPages: Math.ceil(total / limit) }; }
  paginate(filter: FilterQuery<AnalyticsRefresh>, page: number, limit: number) { return this.search(filter, page, limit); }
  softDelete(id: string, deletedBy?: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, deletedAt: new Date(), deletedBy }, { new: true }).exec(); }
  restore(id: string) { return this.model.findOneAndUpdate({ _id: id, isDeleted: true }, { isDeleted: false, deletedAt: null, deletedBy: null }, { new: true }).exec(); }
}
