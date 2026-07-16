import { Injectable } from '@nestjs/common';

import { DataSourceProvider } from '../../../entities/market-intelligence.entity';
import {
  GoogleTrendsTimelineResponse,
  GoogleTrendsRelatedTopicsResponse,
  GoogleTrendsRelatedQueriesResponse,
  GoogleTrendsTrendingSearchesResponse,
  GoogleTrendsGeographicResponse,
  NormalizedTrendData,
  NormalizedTrendsCollection,
} from '../interfaces/google-trends.interface';
import {
  TREND_DIRECTION,
  GOOGLE_TRENDS_QUERY_TYPE,
} from '../constants/google-trends.constants';

@Injectable()
export class GoogleTrendsResponseMapper {
  mapInterestOverTime(
    response: GoogleTrendsTimelineResponse,
    geo: string,
    language: string,
  ): NormalizedTrendsCollection {
    const trend = this.buildBaseTrend(
      response.keyword,
      GOOGLE_TRENDS_QUERY_TYPE.INTEREST_OVER_TIME,
      response.timeRange,
      geo,
      language,
    );

    trend.trendScore = response.averageValue;
    trend.searchVolume = response.maxValue;
    trend.trendDirection = this.computeTrendDirection(response.data.map((d) => d.value));
    trend.growthPercentage = this.computeGrowthPercentage(response.data.map((d) => d.value));
    trend.timeline = response.data;
    trend.sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(response.keyword)}&geo=${geo}`;

    return this.wrapInCollection([trend], GOOGLE_TRENDS_QUERY_TYPE.INTEREST_OVER_TIME, geo, response.timeRange);
  }

  mapRelatedTopics(
    response: GoogleTrendsRelatedTopicsResponse,
    timeRange: string,
    language: string,
  ): NormalizedTrendsCollection {
    const trend = this.buildBaseTrend(
      response.keyword,
      GOOGLE_TRENDS_QUERY_TYPE.RELATED_TOPICS,
      timeRange,
      response.geo,
      language,
    );

    trend.relatedTopics = [
      ...response.top.map((t) => t.topic),
      ...response.rising.map((t) => t.topic),
    ].slice(0, 20);

    trend.sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(response.keyword)}&geo=${response.geo}`;

    return this.wrapInCollection([trend], GOOGLE_TRENDS_QUERY_TYPE.RELATED_TOPICS, response.geo, timeRange);
  }

  mapRelatedQueries(
    response: GoogleTrendsRelatedQueriesResponse,
    timeRange: string,
    language: string,
  ): NormalizedTrendsCollection {
    const trend = this.buildBaseTrend(
      response.keyword,
      GOOGLE_TRENDS_QUERY_TYPE.RELATED_QUERIES,
      timeRange,
      response.geo,
      language,
    );

    trend.relatedQueries = response.top.map((q) => q.query).slice(0, 10);
    trend.risingQueries = response.rising.map((q) => q.query).slice(0, 10);
    trend.sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(response.keyword)}&geo=${response.geo}`;

    return this.wrapInCollection([trend], GOOGLE_TRENDS_QUERY_TYPE.RELATED_QUERIES, response.geo, timeRange);
  }

  mapTrendingSearches(
    response: GoogleTrendsTrendingSearchesResponse,
    language: string,
  ): NormalizedTrendsCollection {
    const trends: NormalizedTrendData[] = response.items.map((item) => {
      const trend = this.buildBaseTrend(
        item.title,
        GOOGLE_TRENDS_QUERY_TYPE.TRENDING_SEARCHES,
        'now 1-d',
        response.geo,
        language,
      );
      trend.trendScore = 100;
      trend.trendDirection = TREND_DIRECTION.RISING;
      trend.searchVolume = this.parseTrafficVolume(item.trafficVolume);
      trend.sourceUrl = item.articleLinks[0] ?? null;
      return trend;
    });

    return this.wrapInCollection(trends, GOOGLE_TRENDS_QUERY_TYPE.TRENDING_SEARCHES, response.geo, 'now 1-d');
  }

  mapGeographicInterest(
    response: GoogleTrendsGeographicResponse,
    language: string,
  ): NormalizedTrendsCollection {
    const trend = this.buildBaseTrend(
      response.keyword,
      GOOGLE_TRENDS_QUERY_TYPE.GEOGRAPHIC_INTEREST,
      response.timeRange,
      '',
      language,
    );

    trend.geographicInterest = response.items;
    trend.sourceUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(response.keyword)}`;

    return this.wrapInCollection([trend], GOOGLE_TRENDS_QUERY_TYPE.GEOGRAPHIC_INTEREST, '', response.timeRange);
  }

  mapRisingQueries(
    response: GoogleTrendsRelatedQueriesResponse,
    timeRange: string,
    language: string,
  ): NormalizedTrendsCollection {
    const trends: NormalizedTrendData[] = response.rising.map((q) => {
      const trend = this.buildBaseTrend(
        q.query,
        GOOGLE_TRENDS_QUERY_TYPE.RISING_QUERIES,
        timeRange,
        response.geo,
        language,
      );
      trend.trendDirection = TREND_DIRECTION.RISING;
      trend.growthPercentage = typeof q.value === 'number' ? q.value : null;
      trend.trendScore = typeof q.value === 'number' ? Math.min(100, q.value) : 100;
      trend.sourceUrl = q.link ?? null;
      return trend;
    });

    return this.wrapInCollection(trends, GOOGLE_TRENDS_QUERY_TYPE.RISING_QUERIES, response.geo, timeRange);
  }

  private buildBaseTrend(
    keyword: string,
    queryType: string,
    timeRange: string,
    geo: string,
    language: string,
  ): NormalizedTrendData {
    return {
      provider: DataSourceProvider.GOOGLE_TRENDS,
      keyword,
      trendScore: null,
      trendDirection: null,
      searchVolume: null,
      growthPercentage: null,
      region: geo || null,
      language,
      timeRange,
      relatedTopics: [],
      relatedQueries: [],
      risingQueries: [],
      sourceUrl: null,
      collectedAt: new Date().toISOString(),
      timeline: [],
      geographicInterest: [],
      queryType,
    };
  }

  private wrapInCollection(
    trends: NormalizedTrendData[],
    queryType: string,
    geo: string,
    timeRange: string,
  ): NormalizedTrendsCollection {
    return {
      trends,
      totalCount: trends.length,
      queryType,
      geo,
      timeRange,
      collectedAt: new Date().toISOString(),
    };
  }

  private computeTrendDirection(values: number[]): string {
    if (values.length < 2) return TREND_DIRECTION.STABLE;
    const half = Math.floor(values.length / 2);
    const firstHalfAvg = values.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondHalfAvg = values.slice(half).reduce((a, b) => a + b, 0) / (values.length - half);
    const diff = secondHalfAvg - firstHalfAvg;

    if (diff > 5) return TREND_DIRECTION.RISING;
    if (diff < -5) return TREND_DIRECTION.DECLINING;
    return TREND_DIRECTION.STABLE;
  }

  private computeGrowthPercentage(values: number[]): number | null {
    if (values.length < 2) return null;
    const first = values[0];
    const last = values[values.length - 1];
    if (!first) return null;
    return Number((((last - first) / first) * 100).toFixed(1));
  }

  private parseTrafficVolume(traffic: string): number | null {
    const clean = traffic.replace(/[K+M+ ]/g, '').trim();
    const num = parseFloat(clean);
    if (isNaN(num)) return null;
    if (traffic.includes('M')) return num * 1_000_000;
    if (traffic.includes('K')) return num * 1_000;
    return num;
  }
}
