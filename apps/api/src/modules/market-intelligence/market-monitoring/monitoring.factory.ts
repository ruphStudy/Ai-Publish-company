import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';

import {
  CreateMonitoringExecutionData,
  UpdateMonitoringExecutionData,
} from './interfaces/monitoring-job.repository.interface';
import {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
  MonitoringJobDefinition,
  MonitoringRunMetrics,
} from './models/monitoring.model';

@Injectable()
export class MonitoringFactory {
  createExecution(
    job: MonitoringJobDefinition,
    executionType: MonitoringExecutionType,
    triggeredBy?: string,
    retryCount = 0,
  ): CreateMonitoringExecutionData {
    return {
      executionId: randomUUID(),
      jobName: job.name,
      provider: job.provider,
      status: MonitoringExecutionStatus.PENDING,
      startTime: new Date(),
      retryCount,
      executionType,
      triggeredBy:
        triggeredBy && Types.ObjectId.isValid(triggeredBy)
          ? new Types.ObjectId(triggeredBy)
          : null,
    };
  }

  completeExecution(
    startedAt: Date,
    metrics: MonitoringRunMetrics,
  ): UpdateMonitoringExecutionData {
    const endTime = new Date();

    return {
      status: MonitoringExecutionStatus.COMPLETED,
      endTime,
      duration: endTime.getTime() - startedAt.getTime(),
      processedRecords: metrics.processedRecords,
      failedRecords: metrics.failedRecords,
      skippedRecords: metrics.skippedRecords,
      errorMessage: null,
    };
  }

  failExecution(
    startedAt: Date,
    error: unknown,
  ): UpdateMonitoringExecutionData {
    const endTime = new Date();

    return {
      status: MonitoringExecutionStatus.FAILED,
      endTime,
      duration: endTime.getTime() - startedAt.getTime(),
      errorMessage: error instanceof Error ? error.message : 'Unknown execution error',
    };
  }
}