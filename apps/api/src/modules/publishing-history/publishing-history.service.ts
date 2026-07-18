import { Injectable } from '@nestjs/common';
import { CreatePublishingHistoryDto, PublishingAuditQueryDto, PublishingHistoryQueryDto } from './dto';
import { PublishingActorType, PublishingHistoryEventType } from './entities/publishing-history.entity';
import { PublishingAuditEngine } from './publishing-audit.engine';
import { PublishingAuditRepository } from './publishing-audit.repository';
import { PublishingHistoryEngine } from './publishing-history.engine';
import { PublishingHistoryQueryService } from './publishing-history-query.service';
import { PublishingHistoryRepository } from './publishing-history.repository';
import { PublishingTimelineBuilder } from './publishing-timeline.builder';

@Injectable()
export class PublishingHistoryService {
  constructor(private readonly history: PublishingHistoryRepository, private readonly audit: PublishingAuditRepository, private readonly historyEngine: PublishingHistoryEngine, private readonly auditEngine: PublishingAuditEngine, private readonly query: PublishingHistoryQueryService, private readonly timeline: PublishingTimelineBuilder) {}
  record(dto: CreatePublishingHistoryDto, actor?: string) { return this.historyEngine.record({ ...dto, message: dto.message ?? dto.eventType, actor, actorType: actor ? PublishingActorType.USER : PublishingActorType.SYSTEM }, actor); }
  auditRecord(input: Parameters<PublishingAuditEngine['record']>[0]) { return this.auditEngine.record(input); }
  projectHistory(projectId: string) { return this.history.findByProjectId(projectId); }
  workflowHistory(workflowId: string) { return this.history.findByWorkflowId(workflowId); }
  orchestrationHistory(orchestrationId: string) { return this.history.findByOrchestrationId(orchestrationId); }
  targetHistory(targetExecutionId: string) { return this.history.findByTargetExecutionId(targetExecutionId); }
  async providerHistory(providerKey: string, query: PublishingHistoryQueryDto) { return this.query.searchHistory({ ...query, providerKey }); }
  async publicationTimeline(query: PublishingHistoryQueryDto) { const result = await this.query.searchHistory({ ...query, page: 1, limit: 1000 }); return this.timeline.build(result.items, query.groupBy); }
  searchHistory(query: PublishingHistoryQueryDto) { return this.query.searchHistory(query); }
  searchAudit(query: PublishingAuditQueryDto) { return this.query.searchAudit(query); }
  listEvents() { return Object.values(PublishingHistoryEventType); }
  listAuditRecords(query: PublishingAuditQueryDto) { return this.audit.paginate(this.query.auditFilter(query), query.page, query.limit); }
}
