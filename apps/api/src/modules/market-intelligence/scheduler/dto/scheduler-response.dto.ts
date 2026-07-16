import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { JobExecutionStatus } from '../entities/job-execution.entity';

export class SchedulerJobResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: 'amazon-kdp-book-trends' })
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  provider: DataSourceProvider;

  @ApiPropertyOptional({ enum: MarketDataType, nullable: true })
  dataType: MarketDataType | null;

  @ApiProperty({ type: 'object', example: { market: 'US' } })
  params: Record<string, unknown>;

  @ApiPropertyOptional({ nullable: true, example: 3600000 })
  intervalMs: number | null;

  @ApiProperty({ example: true })
  isEnabled: boolean;

  @ApiProperty({ example: 3 })
  maxRetries: number;

  @ApiProperty({ example: 5000 })
  retryDelayMs: number;

  @ApiProperty({ example: 30000 })
  timeoutMs: number;

  @ApiPropertyOptional({ nullable: true })
  lastExecutedAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastSucceededAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lastFailedAt: Date | null;

  @ApiProperty({ example: 0 })
  executionCount: number;

  @ApiProperty({ example: 0 })
  successCount: number;

  @ApiProperty({ example: 0 })
  failureCount: number;

  @ApiProperty({ example: 0 })
  consecutiveFailures: number;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  updatedAt: Date;
}

export class JobExecutionResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  jobId: string;

  @ApiProperty({ example: 'amazon-kdp-book-trends' })
  jobName: string;

  @ApiProperty({ enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  provider: DataSourceProvider;

  @ApiProperty({ enum: JobExecutionStatus, example: JobExecutionStatus.PENDING })
  status: JobExecutionStatus;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  startedAt: Date;

  @ApiPropertyOptional({ nullable: true })
  completedAt: Date | null;

  @ApiPropertyOptional({ nullable: true, example: 1523 })
  durationMs: number | null;

  @ApiProperty({ example: 1 })
  attempt: number;

  @ApiPropertyOptional({ nullable: true })
  error: string | null;

  @ApiPropertyOptional({ nullable: true })
  result: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  queueJobId: string | null;

  @ApiPropertyOptional({ nullable: true })
  metadata: Record<string, unknown> | null;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  createdAt: Date;
}

export class PaginatedSchedulerJobResponseDto {
  @ApiProperty({ type: [SchedulerJobResponseDto] })
  data: SchedulerJobResponseDto[];

  @ApiProperty({ example: { total: 10, page: 1, limit: 20, totalPages: 1, hasNextPage: false, hasPrevPage: false } })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class PaginatedJobExecutionResponseDto {
  @ApiProperty({ type: [JobExecutionResponseDto] })
  data: JobExecutionResponseDto[];

  @ApiProperty({ example: { total: 42, page: 1, limit: 20, totalPages: 3, hasNextPage: true, hasPrevPage: false } })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class SchedulerHealthResponseDto {
  @ApiProperty({ enum: ['healthy', 'degraded', 'unhealthy'], example: 'healthy' })
  status: string;

  @ApiProperty({ example: 5 })
  totalJobs: number;

  @ApiProperty({ example: 4 })
  enabledJobs: number;

  @ApiProperty({ example: 1 })
  disabledJobs: number;

  @ApiProperty({ example: 0 })
  runningExecutions: number;

  @ApiProperty({ example: 0 })
  pendingExecutions: number;

  @ApiProperty({ example: 2 })
  failedJobsLast24h: number;

  @ApiProperty({ example: 0 })
  queueSize: number;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  checkedAt: Date;
}

export class TriggerJobResponseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  executionId: string;

  @ApiProperty({ example: 'bullmq-job-id-123' })
  queueJobId: string;

  @ApiProperty({ enum: JobExecutionStatus, example: JobExecutionStatus.PENDING })
  status: JobExecutionStatus;

  @ApiProperty({ example: '2026-07-13T10:00:00.000Z' })
  scheduledAt: Date;
}
