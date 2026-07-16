import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { MonitoringExecutionQueryDto } from './dto';
import {
  MonitoringExecution,
} from './entities/monitoring-execution.entity';
import {
  CreateMonitoringExecutionData,
  MonitoringJobRepositoryInterface,
  PaginatedMonitoringExecutionResult,
  UpdateMonitoringExecutionData,
} from './interfaces/monitoring-job.repository.interface';
import { MonitoringExecutionStatus } from './models/monitoring.model';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -__v' as const;

@Injectable()
export class MonitoringJobRepository implements MonitoringJobRepositoryInterface {
  constructor(
    @InjectModel(MonitoringExecution.name)
    private readonly model: Model<MonitoringExecution>,
  ) {}

  async createExecution(
    data: CreateMonitoringExecutionData,
  ): Promise<MonitoringExecution> {
    const execution = new this.model(data);

    return execution.save();
  }

  async updateExecution(
    executionId: string,
    data: UpdateMonitoringExecutionData,
  ): Promise<MonitoringExecution | null> {
    return this.model
      .findOneAndUpdate({ executionId }, data, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MonitoringExecution | null;
  }

  async findExecution(executionId: string): Promise<MonitoringExecution | null> {
    return this.model
      .findOne({ executionId })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MonitoringExecution | null;
  }

  async listExecutions(
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResult> {
    return this.findAll(query);
  }

  async latestExecution(jobName: string): Promise<MonitoringExecution | null> {
    return this.model
      .findOne({ jobName })
      .sort({ createdAt: -1 })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as MonitoringExecution | null;
  }

  async executionHistory(
    jobName: string,
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResult> {
    return this.findAll({ ...query, jobName });
  }

  async deleteExecution(id: string, deletedBy?: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.model
      .updateOne(
        { _id: new Types.ObjectId(id) },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: deletedBy ?? null,
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async countExecutions(jobName?: string): Promise<number> {
    return this.model.countDocuments(jobName ? { jobName } : {}).exec();
  }

  async hasRunningExecution(jobName: string): Promise<boolean> {
    return (
      (await this.model.countDocuments({
        jobName,
        status: {
          $in: [
            MonitoringExecutionStatus.PENDING,
            MonitoringExecutionStatus.RUNNING,
          ],
        },
      }).exec()) > 0
    );
  }

  private async findAll(
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const filter = this.buildFilter(query);
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as MonitoringExecution[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  private buildFilter(
    query: MonitoringExecutionQueryDto,
  ): FilterQuery<MonitoringExecution> {
    const filter: FilterQuery<MonitoringExecution> = {};

    if (query.jobName) {
      filter.jobName = query.jobName;
    }

    if (query.provider) {
      filter.provider = query.provider;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.executionType) {
      filter.executionType = query.executionType;
    }

    return filter;
  }
}