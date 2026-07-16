import { Injectable, NotFoundException } from '@nestjs/common';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { DataSourceParams } from '../../interfaces/data-source.interface';
import { IProvider, ProviderConfig, ProviderResponse } from '../interfaces/provider.interface';
import { ProviderRegistryService } from '../registry/provider-registry.service';

@Injectable()
export class ProviderFactoryService {
  constructor(private readonly registry: ProviderRegistryService) {}

  resolve(key: string): IProvider {
    const provider = this.registry.resolve(key);
    if (!provider) {
      throw new NotFoundException(`Provider "${key}" is not registered`);
    }
    return provider;
  }

  resolveByDataSource(
    dataSourceProvider: DataSourceProvider,
    dataType?: MarketDataType,
  ): IProvider[] {
    const providers = this.registry.getByProvider(dataSourceProvider);
    if (dataType) {
      return providers.filter((p) => p.supports(dataType));
    }
    return providers;
  }

  resolveByPriority(dataType?: MarketDataType): IProvider[] {
    const providers = dataType
      ? this.registry.getByDataType(dataType)
      : this.registry.getByPriority();
    return providers.sort((a, b) => a.priority - b.priority);
  }

  async execute(
    key: string,
    params: DataSourceParams,
    config: ProviderConfig,
  ): Promise<ProviderResponse> {
    const provider = this.resolve(key);
    return provider.execute(params, config);
  }

  async executeWithFallback(
    keys: string[],
    params: DataSourceParams,
    config: ProviderConfig,
  ): Promise<ProviderResponse> {
    let lastError: ProviderResponse | null = null;

    for (const key of keys) {
      try {
        const provider = this.registry.resolve(key);
        if (!provider) continue;

        const available = await provider.isAvailable();
        if (!available) continue;

        const response = await provider.execute(params, config);
        if (response.success) return response;

        if (!response.error?.retryable) return response;
        lastError = response;
      } catch {
        continue;
      }
    }

    return (
      lastError ?? {
        success: false,
        provider: params.provider,
        key: keys[0] ?? 'unknown',
        version: '0',
        fetchedAt: new Date(),
        durationMs: 0,
        data: null,
        rawData: null,
        metadata: {},
        error: {
          code: 'PROVIDER_UNAVAILABLE' as any,
          message: 'All providers are unavailable',
          provider: params.provider,
          retryable: true,
        },
      }
    );
  }
}
