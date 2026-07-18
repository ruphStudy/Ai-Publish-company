import type { CircuitState, FailureCategory, ResilienceIsolationScope } from '../entities/resilience.entity';

export interface RetryPolicy { attempts: number; delayMs: number; backoff: 'FIXED' | 'LINEAR' | 'EXPONENTIAL'; jitter: boolean; retryBudgetMs?: number; retryableFailures: FailureCategory[]; }
export interface TimeoutPolicy { requestMs: number; queueMs: number; jobMs: number; externalApiMs: number; databaseMs: number; providerMs: number; }
export interface CircuitBreakerPolicy { failureThreshold: number; successThreshold: number; samplingWindowMs: number; resetTimeoutMs: number; isolateBy: ResilienceIsolationScope[]; }
export interface BulkheadPolicy { maxConcurrent: number; maxQueued: number; isolateBy: ResilienceIsolationScope[]; }
export interface RateLimitPolicy { limit: number; windowMs: number; isolateBy: ResilienceIsolationScope[]; }
export interface FallbackPolicy { enabled: boolean; modes: Array<'CACHED_DATA' | 'PARTIAL_RESPONSE' | 'GRACEFUL_DEGRADATION' | 'DEFERRED_PROCESSING' | 'QUEUE_LATER' | 'READ_ONLY'>; }
export interface RecoveryPolicy { automatic: boolean; manualApprovalRequired: boolean; checkpointEnabled: boolean; compensationEnabled: boolean; deferredJobKey?: string; }
export interface CompensationPolicy { enabled: boolean; handlers: string[]; unsafeAutomatic: boolean; }
export interface ResiliencePolicy { key: string; displayName: string; description: string; category: string; retry: RetryPolicy; timeout: TimeoutPolicy; circuitBreaker: CircuitBreakerPolicy; bulkhead: BulkheadPolicy; rateLimit: RateLimitPolicy; fallback: FallbackPolicy; recovery: RecoveryPolicy; compensation: CompensationPolicy; requiredPermissions: string[]; settingsPrefix: string; }
export interface ClassifiedError { category: FailureCategory; retryable: boolean; code: string; message: string; statusCode?: number; providerKey?: string; marketplaceKey?: string; }
export interface RecoveryHandler { key: string; recover(recoveryId: string): Promise<Record<string, unknown> | void>; compensate?(recoveryId: string): Promise<Record<string, unknown> | void>; }
export interface RecoveryMetrics { retryCount: number; retrySuccess: number; retryExhaustion: number; timeoutCount: number; circuitState: CircuitState; recoveryDurationMs: number; recoverySuccess: number; recoveryFailure: number; providerDegradation: number; marketplaceDegradation: number; }
