import { Injectable, Logger } from '@nestjs/common';

import { GoogleTrendsProviderConfig } from '../config/google-trends-provider.config';
import {
  GoogleTrendsTrendRequest,
  GoogleTrendsTimelineResponse,
  GoogleTrendsRelatedTopicsResponse,
  GoogleTrendsRelatedQueriesResponse,
  GoogleTrendsTrendingSearchesResponse,
  GoogleTrendsGeographicResponse,
} from '../interfaces/google-trends.interface';
import { IGoogleTrendsProviderAdapter } from './google-trends-provider-adapter.interface';
import { MOCK_DELAY_MS, GOOGLE_TRENDS_TIME_RANGE } from '../constants/google-trends.constants';
import {
  findClosestKeywordFixture,
  TRENDING_SEARCHES_FIXTURE,
} from '../mock/google-trends-mock.fixtures';

@Injectable()
export class GoogleTrendsMockProviderAdapter implements IGoogleTrendsProviderAdapter {
  private readonly logger = new Logger(GoogleTrendsMockProviderAdapter.name);

  async getInterestOverTime(
    request: GoogleTrendsTrendRequest,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Promise<GoogleTrendsTimelineResponse> {
    await this.simulateLatency();

    this.logger.debug('GoogleTrendsMockProviderAdapter.getInterestOverTime', {
      keyword: request.keyword,
      geo: request.geo,
    });

    const fixture = findClosestKeywordFixture(request.keyword);
    const timeline = fixture?.timeline ?? [];
    const values = timeline.map((t) => t.value);

    return {
      keyword: request.keyword,
      geo: request.geo ?? '',
      timeRange: request.timeRange ?? GOOGLE_TRENDS_TIME_RANGE.PAST_12_MONTHS,
      data: timeline,
      averageValue: values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
      maxValue: values.length ? Math.max(...values) : 0,
      minValue: values.length ? Math.min(...values) : 0,
    };
  }

  async getRelatedTopics(
    request: GoogleTrendsTrendRequest,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Promise<GoogleTrendsRelatedTopicsResponse> {
    await this.simulateLatency();

    this.logger.debug('GoogleTrendsMockProviderAdapter.getRelatedTopics', {
      keyword: request.keyword,
    });

    const fixture = findClosestKeywordFixture(request.keyword);

    return {
      keyword: request.keyword,
      geo: request.geo ?? '',
      rising: fixture?.relatedTopics.rising ?? [],
      top: fixture?.relatedTopics.top ?? [],
    };
  }

  async getRelatedQueries(
    request: GoogleTrendsTrendRequest,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Promise<GoogleTrendsRelatedQueriesResponse> {
    await this.simulateLatency();

    this.logger.debug('GoogleTrendsMockProviderAdapter.getRelatedQueries', {
      keyword: request.keyword,
    });

    const fixture = findClosestKeywordFixture(request.keyword);

    return {
      keyword: request.keyword,
      geo: request.geo ?? '',
      rising: fixture?.relatedQueries.rising ?? [],
      top: fixture?.relatedQueries.top ?? [],
    };
  }

  async getTrendingSearches(
    geo: string,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Promise<GoogleTrendsTrendingSearchesResponse> {
    await this.simulateLatency();

    this.logger.debug('GoogleTrendsMockProviderAdapter.getTrendingSearches', { geo });

    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return {
      geo,
      date,
      items: TRENDING_SEARCHES_FIXTURE,
    };
  }

  async getGeographicInterest(
    request: GoogleTrendsTrendRequest,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Promise<GoogleTrendsGeographicResponse> {
    await this.simulateLatency();

    this.logger.debug('GoogleTrendsMockProviderAdapter.getGeographicInterest', {
      keyword: request.keyword,
    });

    const fixture = findClosestKeywordFixture(request.keyword);

    return {
      keyword: request.keyword,
      timeRange: request.timeRange ?? GOOGLE_TRENDS_TIME_RANGE.PAST_12_MONTHS,
      resolution: 'COUNTRY',
      items: fixture?.geoInterest ?? [],
    };
  }

  private simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  }
}
