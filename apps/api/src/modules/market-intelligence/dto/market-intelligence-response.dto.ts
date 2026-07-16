import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DataSourceProvider, MarketDataType, MarketIntelligenceStatus } from '../entities/market-intelligence.entity';

export class MarketIntelligenceResponseDto {
  @ApiProperty({ description: 'Record ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Record title', example: 'Fantasy Genre Trends Q3 2026' })
  title: string;

  @ApiProperty({ description: 'URL-friendly slug', example: 'fantasy-genre-trends-q3-2026' })
  slug: string;

  @ApiPropertyOptional({ description: 'Record description', nullable: true })
  description: string | null;

  @ApiProperty({ description: 'Data source provider', enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  source: DataSourceProvider;

  @ApiProperty({ description: 'Type of market data', enum: MarketDataType, example: MarketDataType.MARKET_TREND })
  dataType: MarketDataType;

  @ApiProperty({ description: 'Record status', enum: MarketIntelligenceStatus, example: MarketIntelligenceStatus.ACTIVE })
  status: MarketIntelligenceStatus;

  @ApiPropertyOptional({ description: 'Normalized data payload', nullable: true })
  normalizedData: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Opportunity score (0–100)', nullable: true, example: 78.5 })
  opportunityScore: number | null;

  @ApiPropertyOptional({ description: 'Genre classification', nullable: true, example: 'Fantasy' })
  genre: string | null;

  @ApiProperty({ description: 'Associated keywords', type: [String], example: ['fantasy', 'dragons'] })
  keywords: string[];

  @ApiPropertyOptional({ description: 'Language code', nullable: true, example: 'en' })
  language: string | null;

  @ApiPropertyOptional({ description: 'Geographic market', nullable: true, example: 'US' })
  market: string | null;

  @ApiPropertyOptional({ description: 'Data period start (UTC)', nullable: true })
  periodStart: Date | null;

  @ApiPropertyOptional({ description: 'Data period end (UTC)', nullable: true })
  periodEnd: Date | null;

  @ApiPropertyOptional({ description: 'Provider-specific metadata', nullable: true })
  providerMetadata: Record<string, unknown> | null;

  @ApiPropertyOptional({ description: 'Processing error message', nullable: true })
  processingError: string | null;

  @ApiPropertyOptional({ description: 'Last processed timestamp (UTC)', nullable: true })
  lastProcessedAt: Date | null;

  @ApiProperty({ description: 'Creation timestamp (UTC)', example: '2026-07-13T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated timestamp (UTC)', example: '2026-07-13T10:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedMarketIntelligenceResponseDto {
  @ApiProperty({ description: 'Array of market intelligence records', type: [MarketIntelligenceResponseDto] })
  data: MarketIntelligenceResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: { total: 42, page: 1, limit: 10, totalPages: 5, hasNextPage: true, hasPrevPage: false },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
