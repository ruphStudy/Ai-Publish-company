import { Injectable } from '@nestjs/common';

import { DataSourceProvider, MarketDataType } from '../entities/market-intelligence.entity';

export interface SchedulerJobDefinition {
  name: string;
  provider: DataSourceProvider;
  dataType: MarketDataType | null;
  description: string;
  defaultParams: Record<string, unknown>;
  defaultIntervalMs: number | null;
  defaultMaxRetries: number;
  defaultTimeoutMs: number;
}

@Injectable()
export class SchedulerRegistryService {
  private readonly registry = new Map<string, SchedulerJobDefinition>();

  register(definition: SchedulerJobDefinition): void {
    this.registry.set(definition.name, definition);
  }

  unregister(name: string): boolean {
    return this.registry.delete(name);
  }

  get(name: string): SchedulerJobDefinition | undefined {
    return this.registry.get(name);
  }

  has(name: string): boolean {
    return this.registry.has(name);
  }

  getAll(): SchedulerJobDefinition[] {
    return Array.from(this.registry.values());
  }

  getByProvider(provider: DataSourceProvider): SchedulerJobDefinition[] {
    return this.getAll().filter((def) => def.provider === provider);
  }

  getRegisteredProviders(): DataSourceProvider[] {
    const providers = new Set<DataSourceProvider>();
    this.registry.forEach((def) => providers.add(def.provider));
    return Array.from(providers);
  }

  clear(): void {
    this.registry.clear();
  }

  size(): number {
    return this.registry.size;
  }
}
