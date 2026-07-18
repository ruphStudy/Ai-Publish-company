import { Injectable } from '@nestjs/common';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderResponse } from '../../providers/interfaces/provider.interface';
import {
  NormalizedTrendData,
  NormalizedTrendsCollection,
} from '../../providers/google-trends/interfaces/google-trends.interface';
import { ProviderNormalizationStrategy } from '../interfaces/provider-normalization-strategy.interface';
import {
  UnifiedMarketIntelligenceModel} from '../models/unified-market-intelligence.model';
import {
  UnifiedTrendDirection,
} from '../models/unified-market-intelligence.model';

@Injectable()
export class GoogleTrendsNormalizationStrategy implements ProviderNormalizationStrategy {
  readonly provider = DataSourceProvider.GOOGLE_TRENDS;

  async normalize(
    response: ProviderResponse<unknown>,
  ): Promise<UnifiedMarketIntelligenceModel[]> {
    if (!this.isNormalizedTrendsCollection(response.data)) {
      return [];
    }

    return response.data.trends.map((trend) => this.toUnifiedModel(trend, response));
  }

  private toUnifiedModel(
    trend: NormalizedTrendData,
    response: ProviderResponse<unknown>,
  ): UnifiedMarketIntelligenceModel {
    const collectedAt = trend.collectedAt || response.fetchedAt.toISOString();

    return {
      provider: this.provider,
      externalId: this.buildExternalId(trend),
      title: trend.keyword,
      subtitle: null,
      author: null,
      category: null,
      subCategory: null,
      description: null,
      keywords: [
        trend.keyword,
        ...trend.relatedTopics,
        ...trend.relatedQueries,
        ...trend.risingQueries,
      ],
      language: trend.language,
      price: null,
      currency: null,
      rating: null,
      reviewCount: null,
      trendScore: trend.trendScore,
      trendDirection: this.toTrendDirection(trend.trendDirection),
      searchVolume: trend.searchVolume,
      publishDate: null,
      publisher: null,
      format: null,
      sourceUrl: trend.sourceUrl,
      coverImage: null,
      collectedAt,
      metadata: {
        queryType: trend.queryType,
        region: trend.region,
        timeRange: trend.timeRange,
        growthPercentage: trend.growthPercentage,
        relatedTopics: trend.relatedTopics,
        relatedQueries: trend.relatedQueries,
        risingQueries: trend.risingQueries,
        timeline: trend.timeline,
        geographicInterest: trend.geographicInterest,
        providerKey: response.key,
        providerVersion: response.version,
        providerMetadata: response.metadata,
      },
    };
  }

  private buildExternalId(trend: NormalizedTrendData): string {
    const value = [
      trend.keyword,
      trend.region ?? '',
      trend.timeRange ?? '',
      trend.queryType,
    ]
      .join(':')
      .toLowerCase()
      .trim();

    return value.replace(/\s+/g, '-');
  }

  private toTrendDirection(value: string | null): UnifiedTrendDirection | null {
    if (value === UnifiedTrendDirection.RISING) {
      return UnifiedTrendDirection.RISING;
    }

    if (value === UnifiedTrendDirection.STABLE) {
      return UnifiedTrendDirection.STABLE;
    }

    if (value === UnifiedTrendDirection.DECLINING) {
      return UnifiedTrendDirection.DECLINING;
    }

    return null;
  }

  private isNormalizedTrendsCollection(value: unknown): value is NormalizedTrendsCollection {
    if (!this.isRecord(value) || !Array.isArray(value.trends)) {
      return false;
    }

    return value.trends.every((trend) => this.isRecord(trend));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}