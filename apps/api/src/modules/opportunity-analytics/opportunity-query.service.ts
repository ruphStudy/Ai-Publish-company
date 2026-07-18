import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { OpportunityQueryDto } from './dto';
import { Opportunity, OpportunityCategory, OpportunityPriority, OpportunityStatus } from './entities/opportunity-analytics.entity';
import { OpportunityRepository } from './opportunity.repository';

@Injectable()
export class OpportunityQueryService {
  constructor(private readonly repository: OpportunityRepository) {}
  search(query: OpportunityQueryDto) { return this.repository.paginate(this.filter(query), query.page, query.limit); }
  top(query: OpportunityQueryDto) { return this.repository.paginate(this.filter(query), query.page, query.limit); }
  summary(projectId?: string) { return this.repository.search({ ...(projectId ? { projectId } : {}) }, 1, 1000).then((result) => ({ total: result.total, categorySummary: this.count(result.items, 'category'), prioritySummary: this.count(result.items, 'priority'), impactSummary: { available: false } })); }
  private filter(query: OpportunityQueryDto): FilterQuery<Opportunity> { const filter: FilterQuery<Opportunity> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.scope) filter.scope = query.scope; if (query.category) filter.category = query.category; if (query.opportunityType) filter.opportunityType = query.opportunityType; if (query.priority) filter.priority = query.priority; if (query.riskLevel) filter.riskLevel = query.riskLevel; if (query.status) filter.status = query.status; if (query.providerKey) filter.providerKey = query.providerKey; if (query.marketplaceId) filter.marketplaceId = query.marketplaceId; if (query.countryCode) filter.countryCode = query.countryCode; if (query.format) filter.format = query.format; if (query.bookId) filter.bookId = query.bookId; if (query.editionId) filter.editionId = query.editionId; if (query.entityId) filter.entityId = query.entityId; if (query.minimumScore !== undefined) filter.score = { $gte: query.minimumScore }; if (query.minimumConfidence !== undefined) filter.confidence = { $gte: query.minimumConfidence }; return filter; }
  private count(items: Opportunity[], key: keyof Opportunity): Record<string, number> { return items.reduce<Record<string, number>>((acc, item) => { const value = String(item[key] ?? 'UNKNOWN'); acc[value] = (acc[value] ?? 0) + 1; return acc; }, {}); }
  critical(projectId?: string) { return this.search({ projectId, priority: OpportunityPriority.CRITICAL }); }
  accepted(projectId?: string) { return this.search({ projectId, status: OpportunityStatus.ACCEPTED }); }
  snoozed(projectId?: string) { return this.search({ projectId, status: OpportunityStatus.SNOOZED }); }
  dismissed(projectId?: string) { return this.search({ projectId, status: OpportunityStatus.DISMISSED }); }
  resolved(projectId?: string) { return this.search({ projectId, status: OpportunityStatus.RESOLVED }); }
  dataQuality(projectId?: string) { return this.search({ projectId, category: OpportunityCategory.DATA_QUALITY }); }
}
