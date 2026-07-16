import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Types } from 'mongoose';

import { MARKET_INTELLIGENCE_QUEUE } from '../market-intelligence.constants';
import { SchedulerRepository } from './scheduler.repository';
import { SchedulerRegistryService } from './scheduler-registry.service';
import { JobExecutionStatus } from './entities/job-execution.entity';
import {
  CreateSchedulerJobDto,
  UpdateSchedulerJobDto,
  SchedulerJobQueryDto,
  JobExecutionQueryDto,
  SchedulerJobResponseDto,
  JobExecutionResponseDto,
  PaginatedSchedulerJobResponseDto,
  PaginatedJobExecutionResponseDto,
  SchedulerHealthResponseDto,
  TriggerJobResponseDto,
} from './dto';
import { SchedulerJob } from './entities/scheduler-job.entity';
import { JobExecution } from './entities/job-execution.entity';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly repository: SchedulerRepository,
    private readonly registry: SchedulerRegistryService,
    @InjectQueue(MARKET_INTELLIGENCE_QUEUE)
    private readonly queue: Queue,
  ) {}

  private toJobResponseDto(job: SchedulerJob): SchedulerJobResponseDto {
    return {
      id: (job._id as Types.ObjectId).toString(),
      name: job.name,
      description: job.description ?? null,
      provider: job.provider,
      dataType: job.dataType ?? null,
      params: job.params ?? {},
      intervalMs: job.intervalMs ?? null,
      isEnabled: job.isEnabled,
      maxRetries: job.maxRetries,
      retryDelayMs: job.retryDelayMs,
      timeoutMs: job.timeoutMs,
      lastExecutedAt: job.lastExecutedAt ?? null,
      lastSucceededAt: job.lastSucceededAt ?? null,
      lastFailedAt: job.lastFailedAt ?? null,
      executionCount: job.executionCount,
      successCount: job.successCount,
      failureCount: job.failureCount,
      consecutiveFailures: job.consecutiveFailures,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
    };
  }

  private toExecutionResponseDto(execution: JobExecution): JobExecutionResponseDto {
    return {
      id: (execution._id as Types.ObjectId).toString(),
      jobId: (execution.jobId as Types.ObjectId).toString(),
      jobName: execution.jobName,
      provider: execution.provider,
      status: execution.status,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt ?? null,
      durationMs: execution.durationMs ?? null,
      attempt: execution.attempt,
      error: execution.error ?? null,
      result: execution.result ?? null,
      queueJobId: execution.queueJobId ?? null,
      metadata: execution.metadata ?? null,
      createdAt: execution.createdAt,
    };
  }

  async registerJob(dto: CreateSchedulerJobDto, userId: string): Promise<SchedulerJobResponseDto> {
    const exists = await this.repository.existsByName(dto.name);
    if (exists) {
      throw new ConflictException(`Scheduler job with name "${dto.name}" already exists`);
    }

    const definition = this.registry.get(dto.name);

    const job = await this.repository.createJob(
      {
        ...dto,
        params: dto.params ?? definition?.defaultParams ?? {},
        intervalMs: dto.intervalMs ?? definition?.defaultIntervalMs ?? null,
        isEnabled: dto.isEnabled ?? true,
        maxRetries: dto.maxRetries ?? definition?.defaultMaxRetries ?? 3,
        retryDelayMs: dto.retryDelayMs ?? 5000,
        timeoutMs: dto.timeoutMs ?? definition?.defaultTimeoutMs ?? 30000,
      },
      new Types.ObjectId(userId),
    );

    return this.toJobResponseDto(job);
  }

  async listJobs(query: SchedulerJobQueryDto): Promise<PaginatedSchedulerJobResponseDto> {
    const result = await this.repository.findAllJobs(query);
    return {
      data: result.data.map((j) => this.toJobResponseDto(j)),
      meta: result.meta,
    };
  }

  async getJob(id: string): Promise<SchedulerJobResponseDto> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);
    return this.toJobResponseDto(job);
  }

  async updateJob(id: string, dto: UpdateSchedulerJobDto, userId: string): Promise<SchedulerJobResponseDto> {
    const existing = await this.repository.findJobById(id);
    if (!existing) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.repository.existsByName(dto.name, id);
      if (nameExists) throw new ConflictException(`Scheduler job with name "${dto.name}" already exists`);
    }

    const updated = await this.repository.updateJob(id, dto, new Types.ObjectId(userId));
    if (!updated) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    return this.toJobResponseDto(updated);
  }

  async enableJob(id: string, userId: string): Promise<SchedulerJobResponseDto> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    const updated = await this.repository.setJobEnabled(id, true, new Types.ObjectId(userId));
    return this.toJobResponseDto(updated!);
  }

  async disableJob(id: string, userId: string): Promise<SchedulerJobResponseDto> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    const updated = await this.repository.setJobEnabled(id, false, new Types.ObjectId(userId));
    return this.toJobResponseDto(updated!);
  }

  async deleteJob(id: string, userId: string): Promise<void> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    const deleted = await this.repository.softDeleteJob(id, new Types.ObjectId(userId));
    if (!deleted) throw new BadRequestException(`Failed to delete scheduler job with ID "${id}"`);
  }

  async triggerJob(id: string, userId: string): Promise<TriggerJobResponseDto> {
    const job = await this.repository.findJobById(id);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${id}" not found`);

    if (!job.isEnabled) {
      throw new BadRequestException(`Scheduler job "${job.name}" is disabled and cannot be triggered`);
    }

    const running = await this.repository.findRunningExecutions(id);
    if (running.length > 0) {
      throw new ConflictException(`Scheduler job "${job.name}" is already running (execution: ${(running[0]._id as Types.ObjectId).toString()})`);
    }

    const execution = await this.repository.createExecution({
      jobId: job._id as Types.ObjectId,
      jobName: job.name,
      provider: job.provider,
      attempt: 1,
      metadata: { triggeredBy: userId, triggerType: 'manual' },
    });

    const queueJob = await this.queue.add(
      'collect',
      {
        executionId: (execution._id as Types.ObjectId).toString(),
        jobId: id,
        jobName: job.name,
        provider: job.provider,
        dataType: job.dataType,
        params: job.params,
        attempt: 1,
        maxRetries: job.maxRetries,
        timeoutMs: job.timeoutMs,
      },
      { timeout: job.timeoutMs },
    );

    await this.repository.updateExecution((execution._id as Types.ObjectId).toString(), {
      queueJobId: queueJob.id as string,
      status: JobExecutionStatus.PENDING,
    });

    return {
      executionId: (execution._id as Types.ObjectId).toString(),
      queueJobId: queueJob.id as string,
      status: JobExecutionStatus.PENDING,
      scheduledAt: new Date(),
    };
  }

  async retryExecution(executionId: string): Promise<TriggerJobResponseDto> {
    const execution = await this.repository.findExecutionById(executionId);
    if (!execution) throw new NotFoundException(`Execution with ID "${executionId}" not found`);

    if (execution.status !== JobExecutionStatus.FAILED) {
      throw new BadRequestException(`Only FAILED executions can be retried (current: ${execution.status})`);
    }

    const job = await this.repository.findJobById((execution.jobId as Types.ObjectId).toString());
    if (!job) throw new NotFoundException(`Scheduler job not found for execution "${executionId}"`);

    if (!job.isEnabled) {
      throw new BadRequestException(`Scheduler job "${job.name}" is disabled`);
    }

    const attempt = execution.attempt + 1;
    if (attempt > job.maxRetries + 1) {
      throw new BadRequestException(`Maximum retries (${job.maxRetries}) exceeded for job "${job.name}"`);
    }

    const newExecution = await this.repository.createExecution({
      jobId: job._id as Types.ObjectId,
      jobName: job.name,
      provider: job.provider,
      attempt,
      metadata: { retriedFromExecutionId: executionId },
    });

    const queueJob = await this.queue.add(
      'collect',
      {
        executionId: (newExecution._id as Types.ObjectId).toString(),
        jobId: (job._id as Types.ObjectId).toString(),
        jobName: job.name,
        provider: job.provider,
        dataType: job.dataType,
        params: job.params,
        attempt,
        maxRetries: job.maxRetries,
        timeoutMs: job.timeoutMs,
      },
      { delay: job.retryDelayMs, timeout: job.timeoutMs },
    );

    await this.repository.updateExecution((newExecution._id as Types.ObjectId).toString(), {
      queueJobId: queueJob.id as string,
    });

    return {
      executionId: (newExecution._id as Types.ObjectId).toString(),
      queueJobId: queueJob.id as string,
      status: JobExecutionStatus.PENDING,
      scheduledAt: new Date(),
    };
  }

  async cancelExecution(executionId: string): Promise<JobExecutionResponseDto> {
    const execution = await this.repository.findExecutionById(executionId);
    if (!execution) throw new NotFoundException(`Execution with ID "${executionId}" not found`);

    if (![JobExecutionStatus.PENDING, JobExecutionStatus.RUNNING].includes(execution.status)) {
      throw new BadRequestException(`Only PENDING or RUNNING executions can be cancelled (current: ${execution.status})`);
    }

    if (execution.queueJobId) {
      const queueJob = await this.queue.getJob(execution.queueJobId);
      if (queueJob) await queueJob.remove();
    }

    const updated = await this.repository.updateExecution(executionId, {
      status: JobExecutionStatus.CANCELLED,
      completedAt: new Date(),
    });

    return this.toExecutionResponseDto(updated!);
  }

  async getExecutionHistory(
    jobId: string,
    query: JobExecutionQueryDto,
  ): Promise<PaginatedJobExecutionResponseDto> {
    const job = await this.repository.findJobById(jobId);
    if (!job) throw new NotFoundException(`Scheduler job with ID "${jobId}" not found`);

    const result = await this.repository.findExecutionHistory(jobId, query);
    return {
      data: result.data.map((e) => this.toExecutionResponseDto(e)),
      meta: result.meta,
    };
  }

  async getHealth(): Promise<SchedulerHealthResponseDto> {
    const [jobCounts, runningCount, pendingCount, failedLast24h, queueSize] = await Promise.all([
      this.repository.countJobsByEnabled(),
      this.repository.countExecutionsByStatus(JobExecutionStatus.RUNNING),
      this.repository.countExecutionsByStatus(JobExecutionStatus.PENDING),
      this.repository.countExecutionsByStatus(JobExecutionStatus.FAILED, 86400000),
      this.queue.count(),
    ]);

    let status = 'healthy';
    if (failedLast24h > 10 || jobCounts.total === 0) status = 'degraded';
    if (runningCount > 50 || pendingCount > 100) status = 'unhealthy';

    return {
      status,
      totalJobs: jobCounts.total,
      enabledJobs: jobCounts.enabled,
      disabledJobs: jobCounts.disabled,
      runningExecutions: runningCount,
      pendingExecutions: pendingCount,
      failedJobsLast24h: failedLast24h,
      queueSize,
      checkedAt: new Date(),
    };
  }
}
