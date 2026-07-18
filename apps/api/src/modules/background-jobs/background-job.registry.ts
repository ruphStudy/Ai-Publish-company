import { Injectable } from '@nestjs/common';
import { JobCategory, JobFailureCategory, JobIdempotencyScope, JobPriority } from './entities/background-job.entity';
import type { JobDefinition, JobHandler } from './interfaces/background-job.interface';

const retryable = [JobFailureCategory.TRANSIENT, JobFailureCategory.RATE_LIMITED, JobFailureCategory.TIMEOUT, JobFailureCategory.PROVIDER_UNAVAILABLE, JobFailureCategory.UNKNOWN];
const retention = { succeededMs: 1000 * 60 * 60 * 24 * 14, failedMs: 1000 * 60 * 60 * 24 * 30, deadLetterMs: 1000 * 60 * 60 * 24 * 90, checkpointsMs: 1000 * 60 * 60 * 24 * 30, idempotencyMs: 1000 * 60 * 60 * 24, eventsMs: 1000 * 60 * 60 * 24 * 30 };

function definition(input: Partial<JobDefinition> & Pick<JobDefinition, 'key' | 'displayName' | 'description' | 'category' | 'handlerKey'>): JobDefinition {
  return { queue: 'background-jobs', payloadVersion: 1, payloadSchema: {}, requiredPermissions: ['JOBS_TRIGGER'], tenantScoped: true, priority: JobPriority.NORMAL, timeoutMs: 300000, retryPolicy: { attempts: 3, delayMs: 30000, backoff: 'EXPONENTIAL', jitter: true, retryableFailures: retryable }, concurrency: { queue: 10, job: 2, tenant: 3, provider: 2, marketplace: 2 }, idempotency: { enabled: true, scopes: [JobIdempotencyScope.TENANT, JobIdempotencyScope.WORKSPACE, JobIdempotencyScope.ENTITY, JobIdempotencyScope.EXPLICIT_REQUEST_KEY] }, cancellationSupported: true, checkpointSupported: true, scheduleSupported: true, retention, deadLetter: { enabled: true, manualReview: true }, notificationPolicy: { completed: false, failed: true, retrying: true, deadLettered: true }, audit: true, ...input };
}

@Injectable()
export class JobRegistry {
  private readonly handlers = new Map<string, JobHandler>();
  private readonly definitions = new Map<string, JobDefinition>([
    ['publishing.workflow.run', definition({ key: 'publishing.workflow.run', displayName: 'Publishing workflow', description: 'Runs a registered publishing workflow orchestration.', category: JobCategory.PUBLISHING, handlerKey: 'noop.compatibility' })],
    ['metadata.generate', definition({ key: 'metadata.generate', displayName: 'Metadata generation', description: 'Queues metadata generation through existing metadata services.', category: JobCategory.METADATA, handlerKey: 'noop.compatibility' })],
    ['imports.process', definition({ key: 'imports.process', displayName: 'Import processing', description: 'Processes normalized import batches.', category: JobCategory.IMPORTS, handlerKey: 'noop.compatibility' })],
    ['synchronization.provider.sync', definition({ key: 'synchronization.provider.sync', displayName: 'Provider synchronization', description: 'Runs provider synchronization using capability metadata.', category: JobCategory.SYNCHRONIZATION, handlerKey: 'noop.compatibility' })],
    ['sales.ingestion.process', definition({ key: 'sales.ingestion.process', displayName: 'Sales ingestion', description: 'Processes sales ingestion batches.', category: JobCategory.SALES_INGESTION, handlerKey: 'noop.compatibility' })],
    ['revenue.ingestion.process', definition({ key: 'revenue.ingestion.process', displayName: 'Revenue ingestion', description: 'Processes revenue ingestion batches.', category: JobCategory.REVENUE_INGESTION, handlerKey: 'noop.compatibility' })],
    ['royalty.ingestion.process', definition({ key: 'royalty.ingestion.process', displayName: 'Royalty ingestion', description: 'Processes royalty ingestion batches.', category: JobCategory.ROYALTY_INGESTION, handlerKey: 'noop.compatibility' })],
    ['analytics.refresh', definition({ key: 'analytics.refresh', displayName: 'Analytics refresh', description: 'Refreshes repository analytics projections.', category: JobCategory.ANALYTICS, handlerKey: 'noop.compatibility' })],
    ['opportunities.detect', definition({ key: 'opportunities.detect', displayName: 'Opportunity detection', description: 'Runs opportunity analytics detection.', category: JobCategory.OPPORTUNITIES, handlerKey: 'noop.compatibility' })],
    ['ai_insights.generate', definition({ key: 'ai_insights.generate', displayName: 'AI insights generation', description: 'Generates validated AI insights through shared AI infrastructure.', category: JobCategory.AI_INSIGHTS, handlerKey: 'noop.compatibility' })],
    ['notifications.dispatch', definition({ key: 'notifications.dispatch', displayName: 'Notification dispatch', description: 'Dispatches pending notification deliveries.', category: JobCategory.NOTIFICATIONS, handlerKey: 'notifications.dispatch' })],
    ['maintenance.cleanup.retention', definition({ key: 'maintenance.cleanup.retention', displayName: 'Execution retention cleanup', description: 'Cleans expired operational job records according to retention settings.', category: JobCategory.CLEANUP, handlerKey: 'jobs.cleanup', requiredPermissions: ['SYSTEM_JOBS_MANAGE'] })],
    ['monitoring.queue.health', definition({ key: 'monitoring.queue.health', displayName: 'Queue health check', description: 'Collects queue and worker health metrics.', category: JobCategory.MONITORING, handlerKey: 'noop.compatibility', requiredPermissions: ['WORKER_HEALTH_READ'] })],
  ]);

  registerHandler(handler: JobHandler) {
    this.handlers.set(handler.key, handler);
  }

  all() { return [...this.definitions.values()]; }
  find(key: string) { return this.definitions.get(key) ?? null; }
  handler(key: string) { return this.handlers.get(key) ?? null; }
}
