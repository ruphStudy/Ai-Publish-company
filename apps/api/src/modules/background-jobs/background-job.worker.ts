import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import type { Job } from 'bullmq';
import { BACKGROUND_JOBS_QUEUE } from './background-job-dispatcher';
import { JobCheckpointService } from './background-job-checkpoint.service';
import { JobCancellationService } from './background-job-cancellation.service';
import { JobExecutionRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';
import { JobExecutionStatus, JobFailureCategory } from './entities/background-job.entity';

@Injectable()
@Processor(BACKGROUND_JOBS_QUEUE, { concurrency: 10 })
export class BackgroundJobWorker extends WorkerHost implements OnModuleDestroy {
  private readonly workerId = `${process.pid}-${Date.now()}`;

  constructor(
    private readonly registry: JobRegistry,
    private readonly executions: JobExecutionRepository,
    private readonly checkpoints: JobCheckpointService,
    private readonly cancellation: JobCancellationService,
  ) { super(); }

  async process(job: Job<{ executionId: string }>) {
    const execution = await this.executions.findById(job.data.executionId);
    if (!execution) return;
    const definition = this.registry.find(execution.jobKey);
    const handler = definition ? this.registry.handler(definition.handlerKey) : null;
    if (!definition || !handler) {
      await this.executions.update(execution.executionId, { status: JobExecutionStatus.DEAD_LETTERED, deadLetter: true, failureCategory: JobFailureCategory.PERMANENT, errorCode: 'JOB_HANDLER_NOT_REGISTERED', errorMessage: 'Job handler is not registered', completedAt: new Date() });
      return;
    }
    await this.executions.update(execution.executionId, { status: JobExecutionStatus.RUNNING, startedAt: execution.startedAt ?? new Date(), workerId: this.workerId, attemptCount: execution.attemptCount + 1 });
    try {
      const result = await Promise.race([
        handler.handle(execution.payload, { executionId: execution.executionId, tenantId: execution.tenantId, workspaceId: execution.workspaceId, projectId: execution.projectId, providerKey: execution.providerKey, marketplaceKey: execution.marketplaceKey, correlationId: execution.correlationId, cancellationRequested: () => this.cancellation.requested(execution.executionId), checkpoint: (checkpoint, progress) => this.checkpoints.update(execution.executionId, checkpoint, progress).then(() => undefined) }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('JOB_TIMED_OUT')), definition.timeoutMs)),
      ]);
      if (await this.cancellation.requested(execution.executionId)) return this.executions.update(execution.executionId, { status: JobExecutionStatus.CANCELLED, completedAt: new Date() });
      await this.executions.update(execution.executionId, { status: JobExecutionStatus.SUCCEEDED, progress: 100, completedAt: new Date(), resultSummary: (result as Record<string, unknown>) ?? {} });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Job failed';
      const timedOut = message === 'JOB_TIMED_OUT';
      const exhausted = execution.attemptCount + 1 >= definition.retryPolicy.attempts;
      await this.executions.update(execution.executionId, { status: timedOut ? JobExecutionStatus.TIMED_OUT : exhausted ? JobExecutionStatus.DEAD_LETTERED : JobExecutionStatus.RETRYING, deadLetter: exhausted, failureCategory: timedOut ? JobFailureCategory.TIMEOUT : JobFailureCategory.UNKNOWN, errorCode: timedOut ? 'JOB_TIMED_OUT' : 'JOB_FAILED', errorMessage: message.slice(0, 500), completedAt: exhausted || timedOut ? new Date() : null });
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.worker?.close();
  }
}
