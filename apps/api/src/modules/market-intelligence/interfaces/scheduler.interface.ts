import type { DataSourceProvider } from '../entities/market-intelligence.entity';
import type { DataSourceParams } from './data-source.interface';

export interface ScheduledJobDescriptor {
  jobId: string;
  provider: DataSourceProvider;
  params: DataSourceParams;
  scheduledAt: Date;
  repeatInterval?: number;
}

export interface ScheduleCollectionParams {
  provider: DataSourceProvider;
  params: DataSourceParams;
  delay?: number;
  repeatEveryMs?: number;
}

export const MARKET_INTELLIGENCE_SCHEDULER_TOKEN = 'MARKET_INTELLIGENCE_SCHEDULER';

export interface IMarketIntelligenceScheduler {
  scheduleCollection(options: ScheduleCollectionParams): Promise<ScheduledJobDescriptor>;
  cancelJob(jobId: string): Promise<boolean>;
  getJobStatus(jobId: string): Promise<string | null>;
}
