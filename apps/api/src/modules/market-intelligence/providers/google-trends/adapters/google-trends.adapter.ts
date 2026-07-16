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

@Injectable()
export class GoogleTrendsProviderAdapter implements IGoogleTrendsProviderAdapter {
  private readonly logger = new Logger(GoogleTrendsProviderAdapter.name);

  async getInterestOverTime(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsTimelineResponse> {
    this.logger.debug('GoogleTrendsProviderAdapter.getInterestOverTime', {
      keyword: request.keyword,
    });
    throw this.buildNotImplementedError('getInterestOverTime', config, timeoutMs);
  }

  async getRelatedTopics(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsRelatedTopicsResponse> {
    this.logger.debug('GoogleTrendsProviderAdapter.getRelatedTopics', {
      keyword: request.keyword,
    });
    throw this.buildNotImplementedError('getRelatedTopics', config, timeoutMs);
  }

  async getRelatedQueries(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsRelatedQueriesResponse> {
    this.logger.debug('GoogleTrendsProviderAdapter.getRelatedQueries', {
      keyword: request.keyword,
    });
    throw this.buildNotImplementedError('getRelatedQueries', config, timeoutMs);
  }

  async getTrendingSearches(
    geo: string,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsTrendingSearchesResponse> {
    this.logger.debug('GoogleTrendsProviderAdapter.getTrendingSearches', { geo });
    throw this.buildNotImplementedError('getTrendingSearches', config, timeoutMs);
  }

  async getGeographicInterest(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsGeographicResponse> {
    this.logger.debug('GoogleTrendsProviderAdapter.getGeographicInterest', {
      keyword: request.keyword,
    });
    throw this.buildNotImplementedError('getGeographicInterest', config, timeoutMs);
  }

  private buildNotImplementedError(
    method: string,
    _config: GoogleTrendsProviderConfig,
    _timeoutMs: number,
  ): Error {
    return Object.assign(
      new Error(
        `GoogleTrendsProviderAdapter.${method} is not implemented. Set GOOGLE_TRENDS_USE_MOCK=true or provide a real integration.`,
      ),
      { code: 'PROVIDER_UNAVAILABLE' },
    );
  }
}
