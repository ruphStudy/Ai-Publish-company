import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PublishingAuditRepository } from './publishing-audit.repository';
import { PublishingAuditEventMapper } from './publishing-audit-event.mapper';
import type { PublishingAuditRecordInput } from './interfaces/publishing-history.interface';

@Injectable()
export class PublishingAuditEngine {
  constructor(private readonly repository: PublishingAuditRepository, private readonly mapper: PublishingAuditEventMapper) {}
  record(input: PublishingAuditRecordInput) { return this.repository.create({ auditId: `PAE-${randomUUID()}`, entityType: input.entityType, entityId: input.entityId, action: input.action, before: this.mapper.mask(input.before), after: this.mapper.mask(input.after), performedBy: input.performedBy ?? null, source: input.source, reason: input.reason ?? null, timestamp: input.timestamp ?? new Date(), correlationId: input.correlationId ?? null, metadata: this.mapper.mask(input.metadata) ?? {}, createdBy: input.performedBy ?? null, updatedBy: input.performedBy ?? null }); }
}
