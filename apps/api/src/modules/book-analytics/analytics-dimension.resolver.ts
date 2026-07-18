import { Injectable } from '@nestjs/common';
import type { AnalyticsQueryDto } from './dto';

@Injectable()
export class AnalyticsDimensionResolver {
  salesFilter(query: AnalyticsQueryDto, start: Date, end: Date) { return { ...(query.projectId ? { projectId: query.projectId } : {}), ...(query.bookId ?? query.entityId ? { bookId: query.bookId ?? query.entityId } : {}), ...(query.editionId ? { editionId: query.editionId } : {}), ...(query.providerKey ? { providerKey: query.providerKey } : {}), ...(query.marketplaceId ? { marketplaceId: query.marketplaceId } : {}), ...(query.countryCode ? { countryCode: query.countryCode } : {}), ...(query.format ? { format: query.format } : {}), saleDateUtc: { $gte: start, $lte: end } }; }
  royaltyFilter(query: AnalyticsQueryDto, start: Date, end: Date) { return { ...(query.projectId ? { projectId: query.projectId } : {}), ...(query.bookId ?? query.entityId ? { bookId: query.bookId ?? query.entityId } : {}), ...(query.editionId ? { editionId: query.editionId } : {}), ...(query.providerKey ? { providerKey: query.providerKey } : {}), ...(query.marketplaceId ? { marketplaceId: query.marketplaceId } : {}), ...(query.countryCode ? { countryCode: query.countryCode } : {}), ...(query.format ? { format: query.format } : {}), royaltyPeriodStart: { $lte: end }, royaltyPeriodEnd: { $gte: start } }; }
}
