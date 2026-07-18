import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import type { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { JobExecution, JobExecutionDocument, JobExecutionStatus, JobIdempotencyRecord, JobIdempotencyRecordDocument, JobSchedule, JobScheduleDocument, JobScheduleStatus } from './entities/background-job.entity';

@Injectable()
export class JobExecutionRepository {
  constructor(@InjectModel(JobExecution.name) private readonly model: Model<JobExecutionDocument>) {}
  create(input: Partial<JobExecution>) { return this.model.create({ executionId: input.executionId ?? `JEX-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<JobExecution>) { return this.model.findOneAndUpdate({ executionId: id }, update, { new: true }).exec(); }
  findById(id: string) { return this.model.findOne({ executionId: id }).exec(); }
  findActive(filter: FilterQuery<JobExecution>) { return this.model.findOne({ ...filter, status: { $in: [JobExecutionStatus.PENDING, JobExecutionStatus.SCHEDULED, JobExecutionStatus.QUEUED, JobExecutionStatus.RUNNING, JobExecutionStatus.RETRYING] } }).exec(); }
  paginate(filter: FilterQuery<JobExecution>, page = 1, limit = 25) { const bounded = Math.min(Math.max(limit, 1), 100); const skip = (Math.max(page, 1) - 1) * bounded; return Promise.all([this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(bounded).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit: bounded })); }
  cleanup(before: Date, statuses: JobExecutionStatus[]) { return this.model.updateMany({ status: { $in: statuses }, updatedAt: { $lt: before } }, { isDeleted: true, deletedAt: new Date() }).exec(); }
}

@Injectable()
export class JobScheduleRepository {
  constructor(@InjectModel(JobSchedule.name) private readonly model: Model<JobScheduleDocument>) {}
  create(input: Partial<JobSchedule>) { return this.model.create({ scheduleId: input.scheduleId ?? `JSC-${randomUUID()}`, ...input }); }
  update(id: string, update: UpdateQuery<JobSchedule>) { return this.model.findOneAndUpdate({ scheduleId: id }, update, { new: true }).exec(); }
  upsert(id: string | undefined, input: Partial<JobSchedule>) { return id ? this.update(id, input) : this.create(input); }
  findById(id: string) { return this.model.findOne({ scheduleId: id }).exec(); }
  due(now = new Date(), limit = 50) { return this.model.find({ status: JobScheduleStatus.ENABLED, nextRunAt: { $lte: now }, locked: { $ne: true } }).sort({ nextRunAt: 1 }).limit(limit).exec(); }
  paginate(filter: FilterQuery<JobSchedule>, page = 1, limit = 25) { const bounded = Math.min(Math.max(limit, 1), 100); const skip = (Math.max(page, 1) - 1) * bounded; return Promise.all([this.model.find(filter).sort({ nextRunAt: 1, createdAt: -1 }).skip(skip).limit(bounded).exec(), this.model.countDocuments(filter).exec()]).then(([items, total]) => ({ items, total, page, limit: bounded })); }
}

@Injectable()
export class JobIdempotencyRepository {
  constructor(@InjectModel(JobIdempotencyRecord.name) private readonly model: Model<JobIdempotencyRecordDocument>) {}
  async reserve(key: string, executionId: string, jobKey: string, ttlMs: number) {
    try { return await this.model.create({ key, executionId, jobKey, expiresAt: new Date(Date.now() + ttlMs) }); } catch { return this.model.findOne({ key }).exec(); }
  }
  find(key: string) { return this.model.findOne({ key }).exec(); }
}
