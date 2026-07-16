import { Injectable } from '@nestjs/common';

import {
  DataSourceProvider,
  MarketDataType,
} from '../../entities/market-intelligence.entity';
import { MonitoringJobDefinition } from '../models/monitoring.model';

@Injectable()
export class MonitoringConfigurationService {
  getEnabledJobs(): MonitoringJobDefinition[] {
    return this.getJobs().filter((job) => job.isEnabled);
  }

  getJob(name: string): MonitoringJobDefinition | undefined {
    return this.getJobs().find((job) => job.name === name);
  }

  getJobs(): MonitoringJobDefinition[] {
    const configuredJobs = this.parseConfiguredJobs();

    return configuredJobs.length > 0 ? configuredJobs : this.getDefaultJobs();
  }

  private parseConfiguredJobs(): MonitoringJobDefinition[] {
    const value = process.env.MARKET_MONITORING_JOBS;

    if (!value) {
      return [];
    }

    try {
      const jobs = JSON.parse(value) as MonitoringJobDefinition[];

      return jobs.filter((job) => this.isValidJob(job));
    } catch {
      return [];
    }
  }

  private getDefaultJobs(): MonitoringJobDefinition[] {
    return [
      {
        name: 'amazon-market-monitoring',
        providerKey: 'amazon-kdp-v1',
        provider: DataSourceProvider.AMAZON_KDP,
        isEnabled: true,
        intervalMs: Number(process.env.AMAZON_MONITORING_INTERVAL_MS ?? 3600000),
        params: {
          provider: DataSourceProvider.AMAZON_KDP,
          dataType: MarketDataType.BOOK_OPPORTUNITY,
          market: process.env.AMAZON_MARKETPLACE ?? 'www.amazon.com',
          language: process.env.AMAZON_LANGUAGE ?? 'en',
          options: {
            keywords: process.env.AMAZON_MONITORING_KEYWORDS ?? '',
          },
        },
        providerConfig: {
          key: 'amazon-kdp-v1',
          timeoutMs: Number(process.env.AMAZON_PROVIDER_TIMEOUT_MS ?? 30000),
          maxRetries: Number(process.env.AMAZON_PROVIDER_MAX_RETRIES ?? 3),
          retryDelayMs: Number(process.env.AMAZON_PROVIDER_RETRY_DELAY_MS ?? 5000),
        },
      },
      {
        name: 'google-trends-market-monitoring',
        providerKey: 'google-trends-v1',
        provider: DataSourceProvider.GOOGLE_TRENDS,
        isEnabled: true,
        intervalMs: Number(
          process.env.GOOGLE_TRENDS_MONITORING_INTERVAL_MS ?? 3600000,
        ),
        params: {
          provider: DataSourceProvider.GOOGLE_TRENDS,
          dataType: MarketDataType.MARKET_TREND,
          market: process.env.GOOGLE_TRENDS_GEO ?? 'US',
          language: process.env.GOOGLE_TRENDS_LANGUAGE ?? 'en',
          options: {
            keyword: process.env.GOOGLE_TRENDS_MONITORING_KEYWORD ?? 'books',
          },
        },
        providerConfig: {
          key: 'google-trends-v1',
          timeoutMs: Number(
            process.env.GOOGLE_TRENDS_PROVIDER_TIMEOUT_MS ?? 30000,
          ),
          maxRetries: Number(
            process.env.GOOGLE_TRENDS_PROVIDER_MAX_RETRIES ?? 3,
          ),
          retryDelayMs: Number(
            process.env.GOOGLE_TRENDS_PROVIDER_RETRY_DELAY_MS ?? 5000,
          ),
        },
      },
    ];
  }

  private isValidJob(job: MonitoringJobDefinition): boolean {
    return Boolean(
      job.name &&
        job.providerKey &&
        job.provider &&
        job.params &&
        job.providerConfig,
    );
  }
}