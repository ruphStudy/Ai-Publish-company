import { Injectable } from '@nestjs/common';
import { MultiPlatformExecutionStrategy } from './entities/multi-platform-publishing.entity';
import type { ResolvedProviderTarget } from './interfaces/multi-platform-publishing.interface';

@Injectable()
export class PublishingExecutionStrategyFactory {
  order(targets: ResolvedProviderTarget[], strategy: MultiPlatformExecutionStrategy): ResolvedProviderTarget[] { if ([MultiPlatformExecutionStrategy.SEQUENTIAL, MultiPlatformExecutionStrategy.PRIORITY_ORDERED, MultiPlatformExecutionStrategy.DEPENDENCY_AWARE].includes(strategy)) return [...targets].sort((a, b) => a.priority - b.priority); return targets; }
}
