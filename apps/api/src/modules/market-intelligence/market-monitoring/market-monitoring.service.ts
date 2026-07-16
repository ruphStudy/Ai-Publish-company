import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import {
  MonitoringExecutionQueryDto,
  MonitoringExecutionResponseDto,
  PaginatedMonitoringExecutionResponseDto,
} from './dto';
import { MonitoringConfigurationService } from './config/monitoring.configuration.service';
import { MonitoringExecutionEngine } from './monitoring-execution.engine';
import { MonitoringFactory } from './monitoring.factory';
import { MonitoringJobRepository } from './monitoring-job.repository';
import { MonitoringValidator } from './monitoring.validator';
import { MonitoringExecutionType } from './models/monitoring.model';

@Injectable()
export class MarketMonitoringService {
  constructor(
    private readonly configurationService: MonitoringConfigurationService,
    private readonly validator: MonitoringValidator,
    private readonly executionEngine: MonitoringExecutionEngine,
    private readonly repository: MonitoringJobRepository,
    private readonly factory: MonitoringFactory,
  ) {}

  async runManual(
    jobName: string,
    userId?: string,
  ): Promise<MonitoringExecutionResponseDto> {
    return this.execute(jobName, MonitoringExecutionType.MANUAL, userId);
  }

  async runScheduled(
    jobName: string,
  ): Promise<MonitoringExecutionResponseDto> {
    return this.execute(jobName, MonitoringExecutionType.SCHEDULED);
  }

  async retry(
    executionId: string,
    userId?: string,
  ): Promise<MonitoringExecutionResponseDto> {
    const execution = await this.repository.findExecution(executionId);

    if (!execution) {
      throw new NotFoundException(
        `Monitoring execution "${executionId}" not found`,
      );
    }

    if (execution.status !== 'failed') {
      throw new BadRequestException(
        `Only failed monitoring executions can be retried`,
      );
    }

    return this.execute(
      execution.jobName,
      MonitoringExecutionType.RETRY,
      userId,
      execution.retryCount + 1,
    );
  }

  async findExecution(
    executionId: string,
  ): Promise<MonitoringExecutionResponseDto> {
    const execution = await this.repository.findExecution(executionId);

    if (!execution) {
      throw new NotFoundException(
        `Monitoring execution "${executionId}" not found`,
      );
    }

    return this.toResponse(execution);
  }

  async listExecutions(
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResponseDto> {
    const result = await this.repository.listExecutions(query);

    return {
      data: result.data.map((execution) => this.toResponse(execution)),
      meta: result.meta,
    };
  }

  async latestExecution(
    jobName: string,
  ): Promise<MonitoringExecutionResponseDto> {
    const execution = await this.repository.latestExecution(jobName);

    if (!execution) {
      throw new NotFoundException(
        `No monitoring execution found for job "${jobName}"`,
      );
    }

    return this.toResponse(execution);
  }

  async executionHistory(
    jobName: string,
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResponseDto> {
    const result = await this.repository.executionHistory(jobName, query);

    return {
      data: result.data.map((execution) => this.toResponse(execution)),
      meta: result.meta,
    };
  }

  async deleteExecution(id: string, userId?: string): Promise<void> {
    const deleted = await this.repository.deleteExecution(
      id,
      this.toObjectId(userId),
    );

    if (!deleted) {
      throw new NotFoundException(`Monitoring execution "${id}" not found`);
    }
  }

  async countExecutions(jobName?: string): Promise<number> {
    return this.repository.countExecutions(jobName);
  }

  private async execute(
    jobName: string,
    executionType: MonitoringExecutionType,
    userId?: string,
    retryCount = 0,
  ): Promise<MonitoringExecutionResponseDto> {
    const job = this.configurationService.getJob(jobName);

    if (!job) {
      throw new NotFoundException(`Monitoring job "${jobName}" not found`);
    }

    if (!job.isEnabled) {
      throw new BadRequestException(`Monitoring job "${jobName}" is disabled`);
    }

    const validation = this.validator.validateJob(job);

    if (!validation.valid) {
      throw new BadRequestException({
        message: 'Invalid monitoring job configuration',
        errors: validation.errors,
      });
    }

    const execution = await this.executionEngine.execute(
      job,
      executionType,
      userId,
      retryCount,
    );

    if (!execution) {
      throw new NotFoundException(
        `Monitoring execution for job "${jobName}" was not created`,
      );
    }

    return this.toResponse(execution);
  }

  private toResponse(execution: any): MonitoringExecutionResponseDto {
    return {
      id: (execution._id as Types.ObjectId).toString(),
      executionId: execution.executionId,
      jobName: execution.jobName,
      provider: execution.provider,
      status: execution.status,
      startTime: execution.startTime,
      endTime: execution.endTime,
      duration: execution.duration,
      processedRecords: execution.processedRecords,
      failedRecords: execution.failedRecords,
      skippedRecords: execution.skippedRecords,
      retryCount: execution.retryCount,
      errorMessage: execution.errorMessage,
      executionType: execution.executionType,
      triggeredBy: execution.triggeredBy
        ? (execution.triggeredBy as Types.ObjectId).toString()
        : null,
      createdAt: execution.createdAt,
      updatedAt: execution.updatedAt,
    };
  }

  private toObjectId(userId?: string): Types.ObjectId | undefined {
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return undefined;
    }

    return new Types.ObjectId(userId);
  }
}