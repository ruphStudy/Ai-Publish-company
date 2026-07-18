import type { DataSourceProvider } from '../../entities/market-intelligence.entity';
import type { UnifiedTrendDirection } from '../../data-normalizer/models/unified-market-intelligence.model';

export class MarketKnowledgeResponseDto {
  id: string;
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
  publishDate: Date | null;
  publisher: string | null;
  format: string | null;
  sourceUrl: string | null;
  coverImage: string | null;
  metadata: Record<string, unknown>;
  collectedAt: Date;
  lastNormalizedAt: Date;
  dataVersion: number;
  createdAt: Date;
  updatedAt: Date;
}

export class PaginatedMarketKnowledgeResponseDto {
  data: MarketKnowledgeResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}