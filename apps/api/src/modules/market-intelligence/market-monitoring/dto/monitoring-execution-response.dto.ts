import type { DataSourceProvider } from '../../entities/market-intelligence.entity';
import type {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
} from '../models/monitoring.model';

export class MonitoringExecutionResponseDto {
  id: string;
  executionId: string;
  jobName: string;
  provider: DataSourceProvider;
  status: MonitoringExecutionStatus;
  startTime: Date;
  endTime: Date | null;
  duration: number | null;
  processedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  retryCount: number;
  errorMessage: string | null;
  executionType: MonitoringExecutionType;
  triggeredBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedMonitoringExecutionResponseDto {
  data: MonitoringExecutionResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}