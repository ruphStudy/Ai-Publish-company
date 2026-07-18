import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult} from '@nestjs/terminus';
import { HealthIndicator, HealthCheckError } from '@nestjs/terminus';

import { ProviderRegistryService } from '../registry/provider-registry.service';
import { ProviderHealthResult} from '../interfaces/provider.interface';
import { ProviderStatus } from '../interfaces/provider.interface';
import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderHealthSummaryResponseDto } from '../dto';

@Injectable()
export class ProviderHealthService extends HealthIndicator {
  constructor(private readonly registry: ProviderRegistryService) {
    super();
  }

  async checkAll(): Promise<ProviderHealthSummaryResponseDto> {
    const providers = this.registry.getAll();
    const results = await Promise.allSettled(
      providers.map((p) => p.healthCheck()),
    );

    const healthResults: ProviderHealthResult[] = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        key: providers[i].key,
        provider: providers[i].provider,
        version: providers[i].version,
        isAvailable: false,
        status: ProviderStatus.ERROR,
        latencyMs: null,
        checkedAt: new Date(),
        error: r.reason instanceof Error ? r.reason.message : 'Health check failed',
        metadata: {},
      };
    });

    const available = healthResults.filter((r) => r.isAvailable).length;
    const total = healthResults.length;

    let overallStatus = 'healthy';
    if (total === 0 || available === 0) overallStatus = 'unhealthy';
    else if (available < total) overallStatus = 'degraded';

    return {
      overallStatus,
      total,
      available,
      unavailable: total - available,
      providers: healthResults,
      checkedAt: new Date(),
    };
  }

  async checkProvider(key: string): Promise<ProviderHealthResult> {
    const provider = this.registry.resolve(key);
    if (!provider) {
      return {
        key,
        provider: DataSourceProvider.MANUAL,
        version: 'unknown',
        isAvailable: false,
        status: ProviderStatus.INACTIVE,
        latencyMs: null,
        checkedAt: new Date(),
        error: `Provider "${key}" is not registered`,
        metadata: {},
      };
    }
    return provider.healthCheck();
  }

  async check(indicatorKey: string = 'market_providers'): Promise<HealthIndicatorResult> {
    try {
      const summary = await this.checkAll();
      const isHealthy = summary.overallStatus !== 'unhealthy';

      const result = this.getStatus(indicatorKey, isHealthy, {
        status: summary.overallStatus,
        total: summary.total,
        available: summary.available,
      });

      if (!isHealthy) {
        throw new HealthCheckError('Market providers unhealthy', result);
      }

      return result;
    } catch (error) {
      if (error instanceof HealthCheckError) throw error;
      throw new HealthCheckError(
        'Provider health check failed',
        this.getStatus(indicatorKey, false, { error: (error as Error).message }),
      );
    }
  }
}
