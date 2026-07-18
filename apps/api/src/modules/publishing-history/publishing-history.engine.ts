import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PublishingActorType } from './entities/publishing-history.entity';
import { PublishingHistoryRepository } from './publishing-history.repository';
import { PublishingAuditEventMapper } from './publishing-audit-event.mapper';
import type { PublishingHistoryRecordInput } from './interfaces/publishing-history.interface';

@Injectable()
export class PublishingHistoryEngine {
  constructor(private readonly repository: PublishingHistoryRepository, private readonly mapper: PublishingAuditEventMapper) {}
  record(input: PublishingHistoryRecordInput, actor?: string) { return this.repository.create({ eventId: `PHE-${randomUUID()}`, projectId: input.projectId, workflowId: input.workflowId ?? null, orchestrationId: input.orchestrationId ?? null, targetExecutionId: input.targetExecutionId ?? null, providerKey: input.providerKey ?? null, eventType: input.eventType, category: input.category, status: input.status ?? null, previousStatus: input.previousStatus ?? null, actor: input.actor ?? actor ?? null, actorType: input.actorType ?? PublishingActorType.SYSTEM, source: input.source, correlationId: input.correlationId ?? null, message: input.message, metadata: this.mapper.mask(input.metadata) ?? {}, externalReference: input.externalReference ?? null, timestamp: input.timestamp ?? new Date(), createdBy: actor ?? input.actor ?? null, updatedBy: actor ?? input.actor ?? null }); }
}
