import { DataSourceParams } from '../../interfaces/data-source.interface';
import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderConfig } from '../../providers/interfaces/provider.interface';

export enum MonitoringExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum MonitoringExecutionType {
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  RETRY = 'retry',
}

export interface MonitoringJobDefinition {
  name: string;
  providerKey: string;
  provider: DataSourceProvider;
  isEnabled: boolean;
  intervalMs: number | null;
  params: DataSourceParams;
  providerConfig: ProviderConfig;
}

export interface MonitoringRunMetrics {
  processedRecords: number;
  failedRecords: number;
  skippedRecords: number;
}

export interface MonitoringRunResult extends MonitoringRunMetrics {
  startedAt: Date;
  completedAt: Date;
}