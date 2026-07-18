import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { JobExecutionStatus } from './entities/background-job.entity';
import type { JobPayload } from './entities/background-job.entity';
import { JobExecutionRepository, JobIdempotencyRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';
import { JobPolicyService } from './background-job-policy.service';

export const BACKGROUND_JOBS_QUEUE = 'background-jobs';

@Injectable()
export class JobDispatcher {
  constructor(
    @InjectQueue(BACKGROUND_JOBS_QUEUE) private readonly queue: Queue,
    private readonly registry: JobRegistry,
    private readonly executions: JobExecutionRepository,
    private readonly idempotency: JobIdempotencyRepository,
    private readonly policy: JobPolicyService,
  ) {}

  async dispatch(input: { jobKey: string; payload?: JobPayload; tenantId?: string; workspaceId?: string; projectId?: string; providerKey?: string; marketplaceKey?: string; entityType?: string; entityId?: string; idempotencyKey?: string; scheduledAt?: Date; correlationId?: string; parentExecutionId?: string; scheduleId?: string; createdBy?: string }) {
    const definition = this.registry.find(input.jobKey);
    if (!definition) throw new BadRequestException('Job definition is not registered');
    const payload = this.safePayload(input.payload ?? {});
    this.policy.validatePayload(definition, payload);
    const idempotencyKey = this.policy.idempotencyKey(definition, { explicit: input.idempotencyKey, tenantId: input.tenantId, workspaceId: input.workspaceId, providerKey: input.providerKey, marketplaceKey: input.marketplaceKey, entityType: input.entityType, entityId: input.entityId, scheduleId: input.scheduleId, occurrence: input.scheduledAt?.toISOString(), payload });
    if (idempotencyKey) {
      const existing = await this.idempotency.find(idempotencyKey);
      if (existing) return this.executions.findById(existing.executionId);
    }
    const executionId = `JEX-${randomUUID()}`;
    const scheduledAt = input.scheduledAt ?? null;
    const execution = await this.executions.create({ executionId, jobKey: definition.key, payloadVersion: definition.payloadVersion, tenantId: input.tenantId ?? null, workspaceId: input.workspaceId ?? null, projectId: input.projectId ?? null, providerKey: input.providerKey ?? null, marketplaceKey: input.marketplaceKey ?? null, entityType: input.entityType ?? null, entityId: input.entityId ?? null, queue: definition.queue, status: scheduledAt ? JobExecutionStatus.SCHEDULED : JobExecutionStatus.QUEUED, priority: definition.priority, attemptCount: 0, maxAttempts: definition.retryPolicy.attempts, progress: 0, scheduledAt, timeoutMs: definition.timeoutMs, idempotencyKey, correlationId: input.correlationId ?? `COR-${randomUUID()}`, parentExecutionId: input.parentExecutionId ?? null, scheduleId: input.scheduleId ?? null, payload, createdBy: input.createdBy ?? null, updatedBy: input.createdBy ?? null });
    if (idempotencyKey) await this.idempotency.reserve(idempotencyKey, execution.executionId, definition.key, definition.retention.idempotencyMs);
    await this.queue.add(definition.key, { executionId: execution.executionId }, { jobId: execution.executionId, delay: scheduledAt ? Math.max(scheduledAt.getTime() - Date.now(), 0) : 0, priority: definition.priority, attempts: definition.retryPolicy.attempts, backoff: { type: definition.retryPolicy.backoff === 'EXPONENTIAL' ? 'exponential' : 'fixed', delay: definition.retryPolicy.delayMs }, removeOnComplete: true, removeOnFail: false });
    return execution;
  }

  private safePayload(payload: JobPayload) {
    const blocked = new Set(['secret', 'token', 'password', 'credential', 'apiKey', 'clientSecret']);
    return Object.fromEntries(Object.entries(payload).filter(([key]) => !blocked.has(key)));
  }
}
