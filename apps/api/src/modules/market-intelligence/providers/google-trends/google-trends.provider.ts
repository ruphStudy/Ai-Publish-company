import { Injectable, Logger, Inject } from '@nestjs/common';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { DataSourceParams } from '../../interfaces/data-source.interface';
import { BaseProvider } from '../base/base-provider.abstract';
import {
  ProviderCapability,
  ProviderConfig,
  ProviderResponse,
} from '../interfaces/provider.interface';
import {
  GoogleTrendsProviderConfig} from './config/google-trends-provider.config';
import {
  isGoogleTrendsConfigValid,
} from './config/google-trends-provider.config';
import {
  GOOGLE_TRENDS_PROVIDER_KEY,
  GOOGLE_TRENDS_PROVIDER_NAME,
  GOOGLE_TRENDS_PROVIDER_VERSION,
  GOOGLE_TRENDS_QUERY_TYPE,
  GOOGLE_TRENDS_TIME_RANGE,
  GOOGLE_TRENDS_CONFIG_TOKEN,
  GOOGLE_TRENDS_ADAPTER_TOKEN,
} from './constants/google-trends.constants';
import { IGoogleTrendsProviderAdapter } from './adapters/google-trends-provider-adapter.interface';
import { GoogleTrendsResponseMapper } from './mappers/google-trends-response.mapper';
import { GoogleTrendsValidator } from './validators/google-trends.validator';
import { GoogleTrendsExceptionHandler } from './errors/google-trends-exception.handler';
import { NormalizedTrendsCollection } from './interfaces/google-trends.interface';

@Injectable()
export class GoogleTrendsProvider extends BaseProvider {
  readonly key = GOOGLE_TRENDS_PROVIDER_KEY;
  readonly name = GOOGLE_TRENDS_PROVIDER_NAME;
  readonly version = GOOGLE_TRENDS_PROVIDER_VERSION;
  readonly provider = DataSourceProvider.GOOGLE_TRENDS;
  override readonly priority = 2;
  override readonly capabilities: ProviderCapability[] = [
    { dataType: MarketDataType.MARKET_TREND, requiresAuth: false, supportsDateRange: true, supportsKeywords: true },
    { dataType: MarketDataType.KEYWORD_DATA, requiresAuth: false, supportsDateRange: true, supportsKeywords: true },
    { dataType: MarketDataType.GENRE_ANALYSIS, requiresAuth: false, supportsDateRange: true, supportsKeywords: true },
    { dataType: MarketDataType.COMPETITIVE_ANALYSIS, requiresAuth: false, supportsDateRange: true, supportsKeywords: true },
    { dataType: MarketDataType.BOOK_OPPORTUNITY, requiresAuth: false, supportsDateRange: true, supportsKeywords: true },
  ];

  private readonly logger = new Logger(GoogleTrendsProvider.name);

  constructor(
    @Inject(GOOGLE_TRENDS_CONFIG_TOKEN) private readonly trendsConfig: GoogleTrendsProviderConfig,
    @Inject(GOOGLE_TRENDS_ADAPTER_TOKEN) private readonly adapter: IGoogleTrendsProviderAdapter,
    private readonly mapper: GoogleTrendsResponseMapper,
    private readonly validator: GoogleTrendsValidator,
  ) {
    super();
  }

  override supports(dataType: MarketDataType): boolean {
    return this.capabilities.some((c) => c.dataType === dataType);
  }

  override async isAvailable(): Promise<boolean> {
    return isGoogleTrendsConfigValid(this.trendsConfig);
  }

  protected override async validateParams(params: DataSourceParams): Promise<string[]> {
    return this.validator.validate(params);
  }

  protected override async executeInternal(
    params: DataSourceParams,
    config: ProviderConfig,
  ): Promise<ProviderResponse> {
    const startedAt = Date.now();
    const runtimeConfig = this.resolveRuntimeConfig(config);
    const queryType = this.validator.inferQueryType(params);
    const geo = (params.options?.geo as string | undefined) ?? runtimeConfig.geo ?? '';
    const timeRange = (params.options?.timeRange as string | undefined) ?? GOOGLE_TRENDS_TIME_RANGE.PAST_12_MONTHS;
    const timeoutMs = config.timeoutMs ?? runtimeConfig.timeoutMs;

    this.logger.log('Executing GoogleTrendsProvider', {
      queryType,
      dataType: params.dataType,
      geo,
      timeRange,
      useMock: this.trendsConfig.useMock,
    });

    try {
      const collection = await this.executeByQueryType(
        queryType,
        params,
        runtimeConfig,
        timeoutMs,
        geo,
        timeRange,
      );

      return this.buildSuccessResponse(
        collection as unknown as Record<string, unknown>,
        { queryType, geo, timeRange, params },
        startedAt,
        {
          queryType,
          geo,
          timeRange,
          trendCount: collection.trends.length,
          useMock: this.trendsConfig.useMock,
        },
      );
    } catch (error) {
      const providerError = GoogleTrendsExceptionHandler.fromException(error);
      this.logger.error('GoogleTrendsProvider execution failed', {
        errorCode: providerError.code,
        message: providerError.message,
      });
      return this.buildErrorResponse(providerError, startedAt);
    }
  }

  private async executeByQueryType(
    queryType: string,
    params: DataSourceParams,
    config: GoogleTrendsProviderConfig,
    timeoutMs: number,
    geo: string,
    timeRange: string,
  ): Promise<NormalizedTrendsCollection> {
    const keyword = this.resolveKeyword(params);
    const language = (params.language ?? config.language) || 'en-US';
    const category = (params.options?.category as number | undefined) ?? config.category ?? 0;

    const trendRequest = { keyword, geo, language, category, timeRange };

    switch (queryType) {
      case GOOGLE_TRENDS_QUERY_TYPE.INTEREST_OVER_TIME: {
        const response = await this.adapter.getInterestOverTime(trendRequest, config, timeoutMs);
        return this.mapper.mapInterestOverTime(response, geo, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.RELATED_TOPICS: {
        const response = await this.adapter.getRelatedTopics(trendRequest, config, timeoutMs);
        return this.mapper.mapRelatedTopics(response, timeRange, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.RELATED_QUERIES: {
        const response = await this.adapter.getRelatedQueries(trendRequest, config, timeoutMs);
        return this.mapper.mapRelatedQueries(response, timeRange, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.TRENDING_SEARCHES: {
        const response = await this.adapter.getTrendingSearches(geo, config, timeoutMs);
        return this.mapper.mapTrendingSearches(response, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.GEOGRAPHIC_INTEREST: {
        const response = await this.adapter.getGeographicInterest(trendRequest, config, timeoutMs);
        return this.mapper.mapGeographicInterest(response, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.RISING_QUERIES: {
        const response = await this.adapter.getRelatedQueries(trendRequest, config, timeoutMs);
        return this.mapper.mapRisingQueries(response, timeRange, language);
      }

      case GOOGLE_TRENDS_QUERY_TYPE.KEYWORD_TREND:
      default: {
        const [timeline, relatedQ] = await Promise.all([
          this.adapter.getInterestOverTime(trendRequest, config, timeoutMs),
          this.adapter.getRelatedQueries(trendRequest, config, timeoutMs),
        ]);

        const base = this.mapper.mapInterestOverTime(timeline, geo, language);

        if (base.trends.length > 0) {
          const trend = base.trends[0];
          const risingQueries = relatedQ.rising.map((q) => q.query).slice(0, 10);
          const relatedQueries = relatedQ.top.map((q) => q.query).slice(0, 10);
          trend.risingQueries = risingQueries;
          trend.relatedQueries = relatedQueries;
        }

        return { ...base, queryType: GOOGLE_TRENDS_QUERY_TYPE.KEYWORD_TREND };
      }
    }
  }

  private resolveKeyword(params: DataSourceParams): string {
    const options = params.options ?? {};
    if (typeof options.keyword === 'string' && options.keyword.length > 0) {
      return options.keyword;
    }
    if (params.keywords && params.keywords.length > 0) {
      return params.keywords.join(' ');
    }
    if (params.genre) return params.genre;
    return '';
  }

  private resolveRuntimeConfig(config: ProviderConfig): GoogleTrendsProviderConfig {
    const custom = config.customConfig ?? {};
    return {
      apiKey: (custom.apiKey as string | undefined) ?? this.trendsConfig.apiKey,
      host: (custom.host as string | undefined) ?? this.trendsConfig.host,
      geo: (custom.geo as string | undefined) ?? this.trendsConfig.geo,
      language: (custom.language as string | undefined) ?? this.trendsConfig.language,
      category: (custom.category as number | undefined) ?? this.trendsConfig.category,
      timeoutMs: (custom.timeoutMs as number | undefined) ?? this.trendsConfig.timeoutMs,
      maxRetries: config.maxRetries ?? this.trendsConfig.maxRetries,
      retryDelayMs: config.retryDelayMs ?? this.trendsConfig.retryDelayMs,
      useMock: (custom.useMock as boolean | undefined) ?? this.trendsConfig.useMock,
    };
  }
}
