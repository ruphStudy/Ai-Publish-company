import { Injectable } from '@nestjs/common';
import { FailureCategory, ResilienceIsolationScope } from './entities/resilience.entity';
import type { RecoveryHandler, ResiliencePolicy } from './interfaces/resilience.interface';

const retryable = [FailureCategory.TIMEOUT, FailureCategory.NETWORK, FailureCategory.RATE_LIMITED, FailureCategory.DEPENDENCY_UNAVAILABLE, FailureCategory.PROVIDER_FAILURE, FailureCategory.MARKETPLACE_FAILURE, FailureCategory.QUEUE, FailureCategory.STORAGE, FailureCategory.EXTERNAL_API, FailureCategory.CONCURRENCY, FailureCategory.RESOURCE_EXHAUSTED, FailureCategory.PARTIAL_FAILURE, FailureCategory.UNKNOWN];

function policy(input: Partial<ResiliencePolicy> & Pick<ResiliencePolicy, 'key' | 'displayName' | 'description' | 'category'>): ResiliencePolicy {
  return { retry: { attempts: 3, delayMs: 1000, backoff: 'EXPONENTIAL', jitter: true, retryBudgetMs: 300000, retryableFailures: retryable }, timeout: { requestMs: 30000, queueMs: 300000, jobMs: 900000, externalApiMs: 30000, databaseMs: 15000, providerMs: 45000 }, circuitBreaker: { failureThreshold: 5, successThreshold: 2, samplingWindowMs: 60000, resetTimeoutMs: 120000, isolateBy: [ResilienceIsolationScope.SERVICE] }, bulkhead: { maxConcurrent: 10, maxQueued: 100, isolateBy: [ResilienceIsolationScope.SERVICE] }, rateLimit: { limit: 100, windowMs: 60000, isolateBy: [ResilienceIsolationScope.SERVICE] }, fallback: { enabled: true, modes: ['GRACEFUL_DEGRADATION', 'DEFERRED_PROCESSING'] }, recovery: { automatic: false, manualApprovalRequired: true, checkpointEnabled: true, compensationEnabled: false }, compensation: { enabled: false, handlers: [], unsafeAutomatic: false }, requiredPermissions: ['RECOVERY_READ'], settingsPrefix: `resilience.${input.key}`, ...input };
}

@Injectable()
export class ResilienceRegistry {
  private readonly handlers = new Map<string, RecoveryHandler>();
  private readonly policies = new Map<string, ResiliencePolicy>([
    ['provider.integration', policy({ key: 'provider.integration', displayName: 'Provider integration', description: 'Resilience policy for provider adapters.', category: 'PROVIDER', circuitBreaker: { failureThreshold: 4, successThreshold: 2, samplingWindowMs: 60000, resetTimeoutMs: 180000, isolateBy: [ResilienceIsolationScope.PROVIDER] } })],
    ['marketplace.integration', policy({ key: 'marketplace.integration', displayName: 'Marketplace integration', description: 'Resilience policy for marketplace adapters.', category: 'MARKETPLACE', circuitBreaker: { failureThreshold: 4, successThreshold: 2, samplingWindowMs: 60000, resetTimeoutMs: 180000, isolateBy: [ResilienceIsolationScope.MARKETPLACE] } })],
    ['ai.provider', policy({ key: 'ai.provider', displayName: 'AI provider', description: 'Resilience policy for AI provider requests.', category: 'AI', bulkhead: { maxConcurrent: 5, maxQueued: 50, isolateBy: [ResilienceIsolationScope.AI, ResilienceIsolationScope.PROVIDER] } })],
    ['publishing.workflow', policy({ key: 'publishing.workflow', displayName: 'Publishing workflow', description: 'Recovery and compensation policy for publishing workflows.', category: 'PUBLISHING', recovery: { automatic: false, manualApprovalRequired: true, checkpointEnabled: true, compensationEnabled: true }, compensation: { enabled: true, handlers: ['release-locks', 'cleanup-temporary-resources'], unsafeAutomatic: false } })],
    ['queue.worker', policy({ key: 'queue.worker', displayName: 'Queue worker', description: 'Queue and worker fault recovery.', category: 'QUEUE', circuitBreaker: { failureThreshold: 10, successThreshold: 3, samplingWindowMs: 120000, resetTimeoutMs: 60000, isolateBy: [ResilienceIsolationScope.QUEUE] } })],
    ['storage.operation', policy({ key: 'storage.operation', displayName: 'Storage operation', description: 'Storage retry and fallback behavior.', category: 'STORAGE', circuitBreaker: { failureThreshold: 5, successThreshold: 2, samplingWindowMs: 60000, resetTimeoutMs: 120000, isolateBy: [ResilienceIsolationScope.STORAGE] } })],
    ['analytics.read', policy({ key: 'analytics.read', displayName: 'Analytics read', description: 'Graceful degradation for analytics reads.', category: 'ANALYTICS', fallback: { enabled: true, modes: ['CACHED_DATA', 'PARTIAL_RESPONSE', 'READ_ONLY'] } })],
    ['notifications.delivery', policy({ key: 'notifications.delivery', displayName: 'Notification delivery', description: 'Notification retry and deferred dispatch.', category: 'NOTIFICATIONS', fallback: { enabled: true, modes: ['DEFERRED_PROCESSING', 'QUEUE_LATER'] } })],
  ]);

  all() { return [...this.policies.values()]; }
  find(key: string) { return this.policies.get(key) ?? null; }
  registerHandler(handler: RecoveryHandler) { this.handlers.set(handler.key, handler); }
  handler(key: string) { return this.handlers.get(key) ?? null; }
}
