import { DataSourceProvider } from '../../entities/market-intelligence.entity';

export enum UnifiedTrendDirection {
  RISING = 'rising',
  STABLE = 'stable',
  DECLINING = 'declining',
}

export interface UnifiedMarketIntelligenceModel {
  provider: DataSourceProvider;
  externalId: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  category: string | null;
  subCategory: string | null;
  description: string | null;
  keywords: string[];
  language: string | null;
  price: number | null;
  currency: string | null;
  rating: number | null;
  reviewCount: number | null;
  trendScore: number | null;
  trendDirection: UnifiedTrendDirection | null;
  searchVolume: number | null;
  publishDate: string | null;
  publisher: string | null;
  format: string | null;
  sourceUrl: string | null;
  coverImage: string | null;
  collectedAt: string;
  metadata: Record<string, unknown>;
}

export interface NormalizationRejectedRecord {
  index: number;
  reasons: string[];
}

export interface NormalizationResult {
  records: UnifiedMarketIntelligenceModel[];
  receivedCount: number;
  rejectedCount: number;
  duplicateCount: number;
  rejectedRecords: NormalizationRejectedRecord[];
}