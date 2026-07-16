import { Injectable } from '@nestjs/common';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { IProvider } from '../interfaces/provider.interface';

@Injectable()
export class ProviderRegistryService {
  private readonly registry = new Map<string, IProvider>();

  register(provider: IProvider): void {
    this.registry.set(provider.key, provider);
  }

  unregister(key: string): boolean {
    return this.registry.delete(key);
  }

  resolve(key: string): IProvider | undefined {
    return this.registry.get(key);
  }

  has(key: string): boolean {
    return this.registry.has(key);
  }

  getAll(): IProvider[] {
    return Array.from(this.registry.values());
  }

  getByProvider(provider: DataSourceProvider): IProvider[] {
    return this.getAll().filter((p) => p.provider === provider);
  }

  getByDataType(dataType: MarketDataType): IProvider[] {
    return this.getAll().filter((p) => p.supports(dataType));
  }

  getEnabled(): IProvider[] {
    return this.getAll();
  }

  getByPriority(): IProvider[] {
    return this.getAll().sort((a, b) => a.priority - b.priority);
  }

  getRegisteredKeys(): string[] {
    return Array.from(this.registry.keys());
  }

  getRegisteredProviders(): DataSourceProvider[] {
    return [...new Set(this.getAll().map((p) => p.provider))];
  }

  size(): number {
    return this.registry.size;
  }

  clear(): void {
    this.registry.clear();
  }
}
