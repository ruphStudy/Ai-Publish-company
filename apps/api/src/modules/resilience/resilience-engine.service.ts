import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { CircuitState, FailureCategory, RecoveryEventType, RecoveryStatus, ResilienceIsolationScope } from './entities/resilience.entity';
import type { ClassifiedError } from './interfaces/resilience.interface';
import { CircuitStateRepository, RecoveryEventRepository, RecoveryStateRepository } from './resilience.repository';
import { ResilienceRegistry } from './resilience.registry';

@Injectable()
export class ResilienceEngine {
  constructor(private readonly registry: ResilienceRegistry, private readonly recoveries: RecoveryStateRepository, private readonly circuits: CircuitStateRepository, private readonly events: RecoveryEventRepository) {}

  async execute<T>(policyKey: string, isolation: { scope: ResilienceIsolationScope; key: string }, operation: () => Promise<T>) {
    const policy = this.registry.find(policyKey);
    if (!policy) return operation();
    await this.assertCircuit(policyKey, isolation.scope, isolation.key);
    let attempt = 0;
    let lastError: unknown;
    while (attempt < policy.retry.attempts) {
      attempt += 1;
      try {
        const result = await Promise.race([operation(), new Promise<never>((_, reject) => setTimeout(() => reject(new Error('RESILIENCE_TIMEOUT')), policy.timeout.requestMs))]);
        await this.recordSuccess(policyKey, isolation.scope, isolation.key);
        return result;
      } catch (error) {
        lastError = error;
        const classified = this.classified(error);
        await this.recordFailure(policyKey, 'execute', classified, { isolationScope: isolation.scope, isolationKey: isolation.key, attemptCount: attempt });
        if (!classified.retryable || !policy.retry.retryableFailures.includes(classified.category) || attempt >= policy.retry.attempts) break;
        await new Promise((resolve) => setTimeout(resolve, this.delay(policy.retry.delayMs, policy.retry.backoff, attempt, policy.retry.jitter)));
      }
    }
    throw lastError;
  }

  async assertCircuit(policyKey: string, isolationScope: ResilienceIsolationScope, isolationKey: string) {
    const policy = this.registry.find(policyKey);
    const circuit = await this.circuits.find(policyKey, isolationScope, isolationKey);
    if (!policy || !circuit || circuit.state !== CircuitState.OPEN) return;
    const resetAt = circuit.openedAt ? circuit.openedAt.getTime() + policy.circuitBreaker.resetTimeoutMs : 0;
    if (Date.now() >= resetAt) {
      await this.circuits.setState(circuit.circuitId, CircuitState.HALF_OPEN, { halfOpenedAt: new Date() });
      return;
    }
    throw new ServiceUnavailableException('Circuit is open');
  }

  async recordSuccess(policyKey: string, isolationScope: ResilienceIsolationScope, isolationKey: string) {
    const policy = this.registry.find(policyKey);
    const current = await this.circuits.find(policyKey, isolationScope, isolationKey);
    const successCount = (current?.successCount ?? 0) + 1;
    const shouldClose = current?.state === CircuitState.HALF_OPEN && successCount >= (policy?.circuitBreaker.successThreshold ?? 2);
    const circuit = await this.circuits.upsert(policyKey, isolationScope, isolationKey, { state: shouldClose ? CircuitState.CLOSED : current?.state ?? CircuitState.CLOSED, successCount, failureCount: shouldClose ? 0 : current?.failureCount ?? 0, lastSuccessAt: new Date(), openedAt: shouldClose ? null : current?.openedAt ?? null });
    if (shouldClose) await this.events.create({ circuitId: circuit.circuitId, type: RecoveryEventType.CIRCUIT_CLOSED, metadata: { policyKey, isolationScope, isolationKey } });
    return circuit;
  }

  async recordFailure(policyKey: string, operationKey: string, error: ClassifiedError, context: { isolationScope?: ResilienceIsolationScope; isolationKey?: string; tenantId?: string; workspaceId?: string; providerKey?: string; marketplaceKey?: string; entityId?: string; correlationId?: string; safeContext?: Record<string, unknown>; attemptCount?: number }) {
    const policy = this.registry.find(policyKey);
    const maxAttempts = policy?.retry.attempts ?? 1;
    const status = error.retryable ? RecoveryStatus.PENDING : RecoveryStatus.MANUAL_REQUIRED;
    const recovery = await this.recoveries.create({ operationKey, policyKey, failureCategory: error.category, status, isolationScope: context.isolationScope ?? null, tenantId: context.tenantId ?? null, workspaceId: context.workspaceId ?? null, providerKey: context.providerKey ?? null, marketplaceKey: context.marketplaceKey ?? null, entityId: context.entityId ?? null, attemptCount: context.attemptCount ?? 0, maxAttempts, idempotencyKey: null, correlationId: context.correlationId ?? null, safeContext: this.safe(context.safeContext ?? {}), errorCode: error.code, errorMessage: error.message, nextRetryAt: error.retryable ? new Date(Date.now() + (policy?.retry.delayMs ?? 60000)) : null, manualRequired: !error.retryable });
    await this.events.create({ recoveryId: recovery.recoveryId, type: error.retryable ? RecoveryEventType.RETRY_STARTED : RecoveryEventType.MANUAL_RECOVERY_REQUIRED, failureCategory: error.category, tenantId: context.tenantId ?? null, workspaceId: context.workspaceId ?? null, providerKey: context.providerKey ?? null, marketplaceKey: context.marketplaceKey ?? null, correlationId: context.correlationId ?? null, metadata: { policyKey, operationKey, errorCode: error.code } });
    if (context.isolationScope && context.isolationKey) await this.tripCircuit(policyKey, context.isolationScope, context.isolationKey, error);
    return recovery;
  }

  async tripCircuit(policyKey: string, isolationScope: ResilienceIsolationScope, isolationKey: string, error: ClassifiedError) {
    const policy = this.registry.find(policyKey);
    const current = await this.circuits.find(policyKey, isolationScope, isolationKey);
    const failureCount = (current?.failureCount ?? 0) + 1;
    const shouldOpen = failureCount >= (policy?.circuitBreaker.failureThreshold ?? 5);
    const circuit = await this.circuits.upsert(policyKey, isolationScope, isolationKey, { state: shouldOpen ? CircuitState.OPEN : current?.state ?? CircuitState.CLOSED, failureCount, successCount: shouldOpen ? 0 : current?.successCount ?? 0, openedAt: shouldOpen ? new Date() : current?.openedAt ?? null, lastFailureAt: new Date(), lastErrorCode: error.code });
    if (shouldOpen) await this.events.create({ circuitId: circuit.circuitId, type: RecoveryEventType.CIRCUIT_OPENED, failureCategory: error.category, providerKey: isolationScope === ResilienceIsolationScope.PROVIDER ? isolationKey : null, marketplaceKey: isolationScope === ResilienceIsolationScope.MARKETPLACE ? isolationKey : null, metadata: { policyKey, isolationScope, isolationKey } });
    return circuit;
  }

  classified(error: unknown): ClassifiedError {
    if (error instanceof Error && error.message === 'RESILIENCE_TIMEOUT') return { category: FailureCategory.TIMEOUT, retryable: true, code: 'TIMEOUT', message: 'Operation timed out' };
    return { category: FailureCategory.UNKNOWN, retryable: true, code: 'UNKNOWN_FAILURE', message: error instanceof Error ? error.message.slice(0, 500) : 'Unknown failure' };
  }

  private delay(base: number, backoff: string, attempt: number, jitter: boolean) {
    const computed = backoff === 'EXPONENTIAL' ? base * 2 ** (attempt - 1) : backoff === 'LINEAR' ? base * attempt : base;
    return computed + (jitter ? Math.floor(Math.random() * Math.min(base, 1000)) : 0);
  }

  private safe(input: Record<string, unknown>) {
    const blocked = new Set(['secret', 'token', 'password', 'credential', 'apiKey', 'clientSecret']);
    return Object.fromEntries(Object.entries(input).filter(([key]) => !blocked.has(key)));
  }
}
