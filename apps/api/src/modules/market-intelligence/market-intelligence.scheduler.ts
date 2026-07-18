import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { MARKET_INTELLIGENCE_QUEUE } from './market-intelligence.constants';
import { DataSourceProvider, MarketDataType } from './entities/market-intelligence.entity';
import {
  IMarketIntelligenceScheduler,
  ScheduleCollectionParams,
  ScheduledJobDescriptor,
} from './interfaces';

@Injectable()
export class MarketIntelligenceSchedulerService implements IMarketIntelligenceScheduler {
  constructor(
    @InjectQueue(MARKET_INTELLIGENCE_QUEUE)
    private readonly queue: Queue,
  ) {}

  async scheduleCollection(options: ScheduleCollectionParams): Promise<ScheduledJobDescriptor> {
    const job = await this.queue.add(
      'collect',
      { provider: options.provider, params: options.params },
      {
        delay: options.delay,
        repeat: options.repeatEveryMs ? { every: options.repeatEveryMs } : undefined,
      },
    );

    return {
      jobId: job.id as string,
      provider: options.provider,
      params: options.params,
      scheduledAt: new Date(),
      repeatInterval: options.repeatEveryMs,
    };
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.queue.getJob(jobId);
    if (!job) return false;
    await job.remove();
    return true;
  }

  async getJobStatus(jobId: string): Promise<string | null> {
    const job = await this.queue.getJob(jobId);
    if (!job) return null;
    return job.getState();
  }

  async scheduleAllProviders(): Promise<ScheduledJobDescriptor[]> {
    const providers = Object.values(DataSourceProvider).filter(
      (p) => p !== DataSourceProvider.MANUAL,
    );

    const jobs = await Promise.all(
      providers.map((provider) =>
        this.scheduleCollection({
          provider,
          params: { provider, dataType: MarketDataType.MARKET_TREND },
        }),
      ),
    );

    return jobs;
  }
}
