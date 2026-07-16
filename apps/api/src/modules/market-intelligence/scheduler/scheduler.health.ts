import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { MARKET_INTELLIGENCE_QUEUE } from '../market-intelligence.constants';
import { SchedulerRepository } from './scheduler.repository';
import { JobExecutionStatus } from './entities/job-execution.entity';

@Injectable()
export class MarketSchedulerHealthIndicator extends HealthIndicator {
  constructor(
    private readonly repository: SchedulerRepository,
    @InjectQueue(MARKET_INTELLIGENCE_QUEUE)
    private readonly queue: Queue,
  ) {
    super();
  }

  async check(key: string = 'market_scheduler'): Promise<HealthIndicatorResult> {
    try {
      const [jobCounts, runningCount, failedLast1h, queueSize] = await Promise.all([
        this.repository.countJobsByEnabled(),
        this.repository.countExecutionsByStatus(JobExecutionStatus.RUNNING),
        this.repository.countExecutionsByStatus(JobExecutionStatus.FAILED, 3600000),
        this.queue.count(),
      ]);

      const isHealthy = runningCount < 50 && failedLast1h < 20;

      const result = this.getStatus(key, isHealthy, {
        totalJobs: jobCounts.total,
        enabledJobs: jobCounts.enabled,
        runningExecutions: runningCount,
        failedExecutionsLastHour: failedLast1h,
        queueSize,
      });

      if (!isHealthy) {
        throw new HealthCheckError('Market scheduler degraded', result);
      }

      return result;
    } catch (error) {
      if (error instanceof HealthCheckError) throw error;
      throw new HealthCheckError(
        'Market scheduler health check failed',
        this.getStatus(key, false, { error: (error as Error).message }),
      );
    }
  }
}
