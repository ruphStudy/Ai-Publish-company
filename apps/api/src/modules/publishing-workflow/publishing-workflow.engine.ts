import { Injectable } from '@nestjs/common';
import { PublishingRetryStrategyType } from './entities/publishing-workflow.entity';

@Injectable()
export class PublishingWorkflowEngine {
  nextRetryAt(retryCount: number, retryDelayMs: number, strategy: PublishingRetryStrategyType): Date | null { if (strategy === PublishingRetryStrategyType.NONE) return null; const delay = strategy === PublishingRetryStrategyType.EXPONENTIAL ? retryDelayMs * 2 ** Math.max(0, retryCount - 1) : retryDelayMs; return new Date(Date.now() + delay); }
  aggregate(statuses: string[]): 'COMPLETED' | 'PARTIALLY_COMPLETED' | 'FAILED' | 'PROCESSING' { if (statuses.every((status) => status === 'PUBLISHED' || status === 'SUBMITTED')) return 'COMPLETED'; if (statuses.some((status) => status === 'PUBLISHED' || status === 'SUBMITTED') && statuses.some((status) => status === 'FAILED' || status === 'REJECTED')) return 'PARTIALLY_COMPLETED'; if (statuses.every((status) => status === 'FAILED' || status === 'REJECTED')) return 'FAILED'; return 'PROCESSING'; }
  sanitizeProviderResponse(response: Record<string, unknown>): Record<string, unknown> { return Object.fromEntries(Object.entries(response).filter(([key]) => !/secret|token|password|credential|apiKey/i.test(key))); }
}
