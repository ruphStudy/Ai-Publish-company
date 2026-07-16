import { DataSourceProvider } from '../../entities/market-intelligence.entity';

export interface TrendSnapshotClassification {
  primaryCategory: string | null;
  secondaryCategory: string | null;
  niche: string | null;
  demandLevel: string | null;
  competitionLevel: string | null;
  topicType: string | null;
  confidenceScore: number | null;
  classificationVersion: string | null;
}

export interface TrendSnapshotData {
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
}

export interface TrendMetricChange {
  field: string;
  previousValue: number | null;
  currentValue: number | null;
  absoluteChange: number | null;
  percentageChange: number | null;
  isSignificant: boolean;
}

export interface TrendComparisonResult {
  knowledgeRecordId: string;
  previousSnapshotId: string;
  currentSnapshotId: string;
  comparedAt: Date;
  changes: TrendMetricChange[];
  significantChanges: TrendMetricChange[];
}

export interface HistoricalMetricStatistics {
  metric: string;
  minimum: number | null;
  maximum: number | null;
  average: number | null;
  latest: number | null;
  oldest: number | null;
  change: number | null;
  percentageChange: number | null;
}

export interface HistoricalStatisticsResult {
  knowledgeRecordId: string;
  snapshotCount: number;
  firstSnapshotDate: Date | null;
  lastSnapshotDate: Date | null;
  metrics: HistoricalMetricStatistics[];
}