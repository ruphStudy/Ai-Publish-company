import type { GoogleTrendsProviderConfig } from '../config/google-trends-provider.config';
import type {
  GoogleTrendsTrendRequest,
  GoogleTrendsTimelineResponse,
  GoogleTrendsRelatedTopicsResponse,
  GoogleTrendsRelatedQueriesResponse,
  GoogleTrendsTrendingSearchesResponse,
  GoogleTrendsGeographicResponse,
} from '../interfaces/google-trends.interface';

export interface IGoogleTrendsProviderAdapter {
  getInterestOverTime(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsTimelineResponse>;

  getRelatedTopics(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsRelatedTopicsResponse>;

  getRelatedQueries(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsRelatedQueriesResponse>;

  getTrendingSearches(
    geo: string,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsTrendingSearchesResponse>;

  getGeographicInterest(
    request: GoogleTrendsTrendRequest,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
  ): Promise<GoogleTrendsGeographicResponse>;
}
