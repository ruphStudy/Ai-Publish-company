import { Injectable, OnModuleInit } from '@nestjs/common';
import type { JobContext, JobHandler, JobPayload } from './interfaces/background-job.interface';
import { NotificationDeliveryWorker } from '../notification/notification-delivery.worker';
import { JobExecutionStatus } from './entities/background-job.entity';
import { JobExecutionRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';

@Injectable()
export class NoopCompatibilityJobHandler implements JobHandler, OnModuleInit {
  readonly key = 'noop.compatibility';
  constructor(private readonly registry: JobRegistry) {}
  onModuleInit() { this.registry.registerHandler(this); }
  async handle(payload: JobPayload, context: JobContext) { await context.checkpoint({ delegated: true, payloadKeys: Object.keys(payload) }, 100); return { delegated: true, message: 'Registered compatibility job acknowledged by shared background job engine.' }; }
}

@Injectable()
export class NotificationDispatchJobHandler implements JobHandler, OnModuleInit {
  readonly key = 'notifications.dispatch';
  constructor(private readonly registry: JobRegistry, private readonly worker: NotificationDeliveryWorker) {}
  onModuleInit() { this.registry.registerHandler(this); }
  async handle(payload: JobPayload, context: JobContext) { const processed = await this.worker.processPending(Number(payload.limit ?? 50)); await context.checkpoint({ processed: processed.length }, 100); return { processed: processed.length }; }
}

@Injectable()
export class JobRetentionCleanupHandler implements JobHandler, OnModuleInit {
  readonly key = 'jobs.cleanup';
  constructor(private readonly registry: JobRegistry, private readonly executions: JobExecutionRepository) {}
  onModuleInit() { this.registry.registerHandler(this); }
  async handle(payload: JobPayload) { const days = Number(payload.retentionDays ?? 30); const before = new Date(Date.now() - days * 24 * 60 * 60 * 1000); const result = await this.executions.cleanup(before, [JobExecutionStatus.SUCCEEDED, JobExecutionStatus.FAILED, JobExecutionStatus.CANCELLED]); return { matched: result.matchedCount, modified: result.modifiedCount }; }
}
