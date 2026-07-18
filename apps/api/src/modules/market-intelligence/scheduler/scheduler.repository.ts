import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import { SchedulerJob } from './entities/scheduler-job.entity';
import { JobExecution, JobExecutionStatus } from './entities/job-execution.entity';
import { CreateSchedulerJobDto, UpdateSchedulerJobDto, SchedulerJobQueryDto, JobExecutionQueryDto } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const JOB_PROJECTION = '-isDeleted -deletedAt -deletedBy -__v' as const;

@Injectable()
export class SchedulerRepository {
  constructor(
    @InjectModel(SchedulerJob.name)
    private readonly jobModel: Model<SchedulerJob>,
    @InjectModel(JobExecution.name)
    private readonly executionModel: Model<JobExecution>,
  ) {}

  async createJob(data: CreateSchedulerJobDto, userId: Types.ObjectId): Promise<SchedulerJob> {
    const job = new this.jobModel({ ...data, createdBy: userId });
    return job.save();
  }

  async findAllJobs(query: SchedulerJobQueryDto): Promise<PaginatedResult<SchedulerJob>> {
    const { provider, isEnabled, sortBy = 'createdAt', sortOrder = 'asc', page = 1, limit = 20 } = query;

    const filter: FilterQuery<SchedulerJob> = {};
    if (provider !== undefined) filter.provider = provider;
    if (isEnabled !== undefined) filter.isEnabled = isEnabled;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.jobModel.find(filter).sort(sort).skip(skip).limit(limit).select(JOB_PROJECTION).lean().exec(),
      this.jobModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: data as unknown as SchedulerJob[],
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async findJobById(id: string): Promise<SchedulerJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.jobModel.findById(id).select(JOB_PROJECTION).lean().exec() as unknown as SchedulerJob | null;
  }

  async findJobByName(name: string): Promise<SchedulerJob | null> {
    return this.jobModel.findOne({ name }).select(JOB_PROJECTION).lean().exec() as unknown as SchedulerJob | null;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<SchedulerJob> = { name };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.jobModel.countDocuments(filter).exec()) > 0;
  }

  async updateJob(id: string, data: UpdateSchedulerJobDto, userId: Types.ObjectId): Promise<SchedulerJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.jobModel
      .findByIdAndUpdate(id, { ...data, updatedBy: userId }, { new: true })
      .select(JOB_PROJECTION)
      .lean()
      .exec() as unknown as SchedulerJob | null;
  }

  async setJobEnabled(id: string, isEnabled: boolean, userId: Types.ObjectId): Promise<SchedulerJob | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.jobModel
      .findByIdAndUpdate(id, { isEnabled, updatedBy: userId }, { new: true })
      .select(JOB_PROJECTION)
      .lean()
      .exec() as unknown as SchedulerJob | null;
  }

  async softDeleteJob(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.jobModel
      .updateOne({ _id: id }, { isDeleted: true, deletedAt: new Date(), deletedBy: userId })
      .exec();
    return result.modifiedCount > 0;
  }

  async incrementJobCounters(
    id: string,
    success: boolean,
    executedAt: Date,
  ): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    const inc: Record<string, number> = { executionCount: 1 };
    const set: Record<string, Date | number> = { lastExecutedAt: executedAt };

    if (success) {
      inc.successCount = 1;
      set.lastSucceededAt = executedAt;
      set.consecutiveFailures = 0;
    } else {
      inc.failureCount = 1;
      inc.consecutiveFailures = 1;
      set.lastFailedAt = executedAt;
    }

    await this.jobModel.updateOne({ _id: id }, { $inc: inc, $set: set }).exec();
  }

  async createExecution(data: {
    jobId: Types.ObjectId;
    jobName: string;
    provider: string;
    attempt: number;
    queueJobId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<JobExecution> {
    const execution = new this.executionModel({
      ...data,
      status: JobExecutionStatus.PENDING,
      startedAt: new Date(),
    });
    return execution.save();
  }

  async updateExecution(
    id: string,
    data: {
      status?: JobExecutionStatus;
      completedAt?: Date;
      durationMs?: number;
      error?: string;
      errorStack?: string;
      result?: Record<string, unknown>;
      queueJobId?: string;
    },
  ): Promise<JobExecution | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.executionModel
      .findByIdAndUpdate(id, { $set: data }, { new: true })
      .lean()
      .exec() as unknown as JobExecution | null;
  }

  async findExecutionById(id: string): Promise<JobExecution | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.executionModel.findById(id).lean().exec() as unknown as JobExecution | null;
  }

  async findRunningExecutions(jobId: string): Promise<JobExecution[]> {
    if (!Types.ObjectId.isValid(jobId)) return [];
    return this.executionModel
      .find({ jobId: new Types.ObjectId(jobId), status: { $in: [JobExecutionStatus.PENDING, JobExecutionStatus.RUNNING] } })
      .lean()
      .exec() as unknown as JobExecution[];
  }

  async findExecutionHistory(
    jobId: string,
    query: JobExecutionQueryDto,
  ): Promise<PaginatedResult<JobExecution>> {
    if (!Types.ObjectId.isValid(jobId)) {
      return { data: [], meta: { total: 0, page: 1, limit: query.limit ?? 20, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    }

    const { status, sortOrder = 'desc', page = 1, limit = 20 } = query;
    const filter: FilterQuery<JobExecution> = { jobId: new Types.ObjectId(jobId) };
    if (status) filter.status = status;

    const sort: Record<string, 1 | -1> = { createdAt: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.executionModel.find(filter).sort(sort).skip(skip).limit(limit).lean().exec(),
      this.executionModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      data: data as unknown as JobExecution[],
      meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
    };
  }

  async countExecutionsByStatus(status: JobExecutionStatus, sinceMs?: number): Promise<number> {
    const filter: FilterQuery<JobExecution> = { status };
    if (sinceMs) {
      filter.createdAt = { $gte: new Date(Date.now() - sinceMs) };
    }
    return this.executionModel.countDocuments(filter).exec();
  }

  async countJobsByEnabled(): Promise<{ enabled: number; disabled: number; total: number }> {
    const [enabled, total] = await Promise.all([
      this.jobModel.countDocuments({ isEnabled: true }).exec(),
      this.jobModel.countDocuments({}).exec(),
    ]);
    return { enabled, disabled: total - enabled, total };
  }
}
