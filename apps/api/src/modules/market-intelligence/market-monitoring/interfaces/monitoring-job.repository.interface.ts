import type { Types } from 'mongoose';

import type { MonitoringExecutionQueryDto } from '../dto';
import type {
  MonitoringExecution,
} from '../entities/monitoring-execution.entity';
import type {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
} from '../models/monitoring.model';

export interface CreateMonitoringExecutionData {
  executionId: string;
  jobName: string;
  provider: MonitoringExecution['provider'];
  status: MonitoringExecutionStatus;
  startTime: Date;
  retryCount: number;
  executionType: MonitoringExecutionType;
  triggeredBy: Types.ObjectId | null;
}

export interface UpdateMonitoringExecutionData {
  status?: MonitoringExecutionStatus;
  endTime?: Date;
  duration?: number;
  processedRecords?: number;
  failedRecords?: number;
  skippedRecords?: number;
  retryCount?: number;
  errorMessage?: string | null;
}

export interface PaginatedMonitoringExecutionResult {
  data: MonitoringExecution[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface MonitoringJobRepositoryInterface {
  createExecution(
    data: CreateMonitoringExecutionData,
  ): Promise<MonitoringExecution>;
  updateExecution(
    executionId: string,
    data: UpdateMonitoringExecutionData,
  ): Promise<MonitoringExecution | null>;
  findExecution(executionId: string): Promise<MonitoringExecution | null>;
  listExecutions(
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResult>;
  latestExecution(jobName: string): Promise<MonitoringExecution | null>;
  executionHistory(
    jobName: string,
    query: MonitoringExecutionQueryDto,
  ): Promise<PaginatedMonitoringExecutionResult>;
  deleteExecution(id: string, deletedBy?: Types.ObjectId): Promise<boolean>;
  countExecutions(jobName?: string): Promise<number>;
  hasRunningExecution(jobName: string): Promise<boolean>;
}