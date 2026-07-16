import { Injectable } from '@nestjs/common';

import { MarketIntelligenceSchedulerService } from '../market-intelligence.scheduler';
import { MonitoringConfigurationService } from './config/monitoring.configuration.service';

@Injectable()
export class MarketMonitoringScheduler {
  constructor(
    private readonly configurationService: MonitoringConfigurationService,
    private readonly schedulerService: MarketIntelligenceSchedulerService,
  ) {}

  async scheduleEnabledJobs() {
    const jobs = this.configurationService
      .getEnabledJobs()
      .filter((job) => job.intervalMs !== null);

    return Promise.all(
      jobs.map((job) =>
        this.schedulerService.scheduleCollection({
          provider: job.provider,
          params: job.params,
          repeatEveryMs: job.intervalMs ?? undefined,
        }),
      ),
    );
  }
}