import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { PublishingAuditQueryDto, PublishingHistoryQueryDto } from './dto';
import { PublishingAudit } from './entities/publishing-audit.entity';
import { PublishingHistory } from './entities/publishing-history.entity';
import { PublishingAuditRepository } from './publishing-audit.repository';
import { PublishingHistoryRepository } from './publishing-history.repository';

@Injectable()
export class PublishingHistoryQueryService {
  constructor(private readonly history: PublishingHistoryRepository, private readonly audit: PublishingAuditRepository) {}
  searchHistory(query: PublishingHistoryQueryDto) { return this.history.paginate(this.historyFilter(query), query.page, query.limit); }
  searchAudit(query: PublishingAuditQueryDto) { return this.audit.paginate(this.auditFilter(query), query.page, query.limit); }
  historyFilter(query: PublishingHistoryQueryDto): FilterQuery<PublishingHistory> { const filter: FilterQuery<PublishingHistory> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.workflowId) filter.workflowId = query.workflowId; if (query.orchestrationId) filter.orchestrationId = query.orchestrationId; if (query.targetExecutionId) filter.targetExecutionId = query.targetExecutionId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.status) filter.status = query.status; if (query.eventType) filter.eventType = query.eventType; if (query.category) filter.category = query.category; if (query.actor) filter.actor = query.actor; if (query.source) filter.source = query.source; if (query.from || query.to) filter.timestamp = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) }; return filter; }
  auditFilter(query: PublishingAuditQueryDto): FilterQuery<PublishingAudit> { const filter: FilterQuery<PublishingAudit> = {}; if (query.entityType) filter.entityType = query.entityType; if (query.entityId) filter.entityId = query.entityId; if (query.action) filter.action = query.action; if (query.performedBy) filter.performedBy = query.performedBy; if (query.source) filter.source = query.source; if (query.from || query.to) filter.timestamp = { ...(query.from ? { $gte: new Date(query.from) } : {}), ...(query.to ? { $lte: new Date(query.to) } : {}) }; return filter; }
}
