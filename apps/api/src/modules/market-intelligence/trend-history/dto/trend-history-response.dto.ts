import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import {
  HistoricalStatisticsResult,
  TrendComparisonResult,
  TrendSnapshotClassification,
} from '../models/trend-history.model';

export class TrendHistoryResponseDto {
  id: string;
  knowledgeRecordId: string;
  provider: DataSourceProvider;
  externalId: string;
  snapshotDate: Date;
  snapshotVersion: string;
  trendScore: number | null;
  opportunityScore: number | null;
  demandScore: number | null;
  competitionScore: number | null;
  searchVolume: number | null;
  rating: number | null;
  reviewCount: number | null;
  price: number | null;
  classification: TrendSnapshotClassification | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export class PaginatedTrendHistoryResponseDto {
  data: TrendHistoryResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class TrendComparisonResponseDto implements TrendComparisonResult {
  knowledgeRecordId: string;
  previousSnapshotId: string;
  currentSnapshotId: string;
  comparedAt: Date;
  changes: TrendComparisonResult['changes'];
  significantChanges: TrendComparisonResult['significantChanges'];
}

export class HistoricalStatisticsResponseDto
  implements HistoricalStatisticsResult
{
  knowledgeRecordId: string;
  snapshotCount: number;
  firstSnapshotDate: Date | null;
  lastSnapshotDate: Date | null;
  metrics: HistoricalStatisticsResult['metrics'];
}