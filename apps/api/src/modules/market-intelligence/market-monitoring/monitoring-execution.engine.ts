import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { AppLoggerService } from '../../../core/logger/logger.service';
import { MonitoringFactory } from './monitoring.factory';
import { MonitoringJobRepository } from './monitoring-job.repository';
import { MonitoringJobRunner } from './monitoring-job-runner';
import {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
  MonitoringJobDefinition,
} from './models/monitoring.model';

@Injectable()
export class MonitoringExecutionEngine {
  constructor(
    private readonly repository: MonitoringJobRepository,
    private readonly runner: MonitoringJobRunner,
    private readonly factory: MonitoringFactory,
    private readonly logger: AppLoggerService,
  ) {}

  async execute(
    job: MonitoringJobDefinition,
    executionType: MonitoringExecutionType,
    triggeredBy?: string,
    retryCount = 0,
  ) {
    const hasRunningExecution = await this.repository.hasRunningExecution(
      job.name,
    );

    if (hasRunningExecution) {
      throw new ConflictException(
        `Monitoring job "${job.name}" already has an active execution`,
      );
    }

    const execution = await this.repository.createExecution(
      this.factory.createExecution(job, executionType, triggeredBy, retryCount),
    );

    await this.repository.updateExecution(execution.executionId, {
      status: MonitoringExecutionStatus.RUNNING,
    });

    try {
      const result = await this.runner.run(job);
      const completed = await this.repository.updateExecution(
        execution.executionId,
        this.factory.completeExecution(result.startedAt, result),
      );

      this.logger.log({
        message: 'Market monitoring execution completed',
        executionId: execution.executionId,
        jobName: job.name,
        provider: job.provider,
        processedRecords: result.processedRecords,
        failedRecords: result.failedRecords,
        skippedRecords: result.skippedRecords,
      });

      return completed;
    } catch (error) {
      const failed = await this.repository.updateExecution(
        execution.executionId,
        this.factory.failExecution(execution.startTime, error),
      );

      this.logger.error(
        {
          message: 'Market monitoring execution failed',
          executionId: execution.executionId,
          jobName: job.name,
          provider: job.provider,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        error instanceof Error ? error.stack : undefined,
        MonitoringExecutionEngine.name,
      );

      if (!failed) {
        throw new InternalServerErrorException(
          `Failed to persist monitoring execution "${execution.executionId}"`,
        );
      }

      throw error;
    }
  }
}