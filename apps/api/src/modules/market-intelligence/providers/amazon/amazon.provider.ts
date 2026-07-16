import { Injectable, Logger, Inject } from '@nestjs/common';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { DataSourceParams } from '../../interfaces/data-source.interface';
import { BaseProvider } from '../base/base-provider.abstract';
import {
  ProviderCapability,
  ProviderConfig,
  ProviderResponse,
} from '../interfaces/provider.interface';
import { AmazonProviderConfig, isAmazonConfigValid } from './config/amazon-provider.config';
import {
  AMAZON_PROVIDER_KEY,
  AMAZON_PROVIDER_NAME,
  AMAZON_PROVIDER_VERSION,
  AMAZON_BOOKS_SEARCH_INDEX,
  AMAZON_PARTNER_TYPE,
  AMAZON_DEFAULT_ITEM_COUNT,
  AMAZON_SEARCH_TYPE,
  AMAZON_SEARCH_TYPE_SORT_MAP,
  AMAZON_ITEM_RESOURCES,
  AMAZON_CONFIG_TOKEN,
  AMAZON_ADAPTER_TOKEN,
} from './constants/amazon.constants';
import { IAmazonProviderAdapter } from './adapters/amazon-provider-adapter.interface';
import { AmazonResponseMapper } from './mappers/amazon-response.mapper';
import { AmazonProviderValidator } from './validators/amazon.validator';
import { AmazonProviderExceptionHandler } from './errors/amazon-error.handler';
import {
  AmazonSearchItemsRequest,
  AmazonGetItemsRequest,
  NormalizedMarketData,
} from './interfaces/amazon.interface';

@Injectable()
export class AmazonMarketplaceProvider extends BaseProvider {
  readonly key = AMAZON_PROVIDER_KEY;
  readonly name = AMAZON_PROVIDER_NAME;
  readonly version = AMAZON_PROVIDER_VERSION;
  readonly provider = DataSourceProvider.AMAZON_KDP;
  override readonly priority = 1;
  override readonly capabilities: ProviderCapability[] = [
    { dataType: MarketDataType.BOOK_OPPORTUNITY, requiresAuth: true, supportsDateRange: false, supportsKeywords: true },
    { dataType: MarketDataType.MARKET_TREND, requiresAuth: true, supportsDateRange: false, supportsKeywords: true },
    { dataType: MarketDataType.GENRE_ANALYSIS, requiresAuth: true, supportsDateRange: false, supportsKeywords: false },
    { dataType: MarketDataType.KEYWORD_DATA, requiresAuth: true, supportsDateRange: false, supportsKeywords: true },
    { dataType: MarketDataType.PRICING_DATA, requiresAuth: true, supportsDateRange: false, supportsKeywords: false },
    { dataType: MarketDataType.COMPETITIVE_ANALYSIS, requiresAuth: true, supportsDateRange: false, supportsKeywords: true },
  ];

  private readonly logger = new Logger(AmazonMarketplaceProvider.name);

  constructor(
    @Inject(AMAZON_CONFIG_TOKEN) private readonly amazonConfig: AmazonProviderConfig,
    @Inject(AMAZON_ADAPTER_TOKEN) private readonly adapter: IAmazonProviderAdapter,
    private readonly mapper: AmazonResponseMapper,
    private readonly validator: AmazonProviderValidator,
  ) {
    super();
  }

  override supports(dataType: MarketDataType): boolean {
    return this.capabilities.some((c) => c.dataType === dataType);
  }

  override async isAvailable(): Promise<boolean> {
    return isAmazonConfigValid(this.amazonConfig);
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
    const searchType = this.validator.inferSearchType(params);
    const marketplace = runtimeConfig.marketplace;

    this.logger.log('Executing AmazonMarketplaceProvider', {
      searchType,
      dataType: params.dataType,
      market: params.market,
      useMock: this.amazonConfig.useMock,
    });

    try {
      const normalizedData = await this.executeBySearchType(
        searchType,
        params,
        config,
        runtimeConfig,
      );

      return this.buildSuccessResponse(
        normalizedData as unknown as Record<string, unknown>,
        { searchType, marketplace, params },
        startedAt,
        {
          searchType,
          marketplace,
          itemCount: normalizedData.books.length,
          totalCount: normalizedData.totalCount,
          useMock: this.amazonConfig.useMock,
        },
      );
    } catch (error) {
      const providerError = AmazonProviderExceptionHandler.fromException(error);
      this.logger.error('AmazonMarketplaceProvider execution failed', {
        errorCode: providerError.code,
        message: providerError.message,
      });
      return this.buildErrorResponse(providerError, startedAt);
    }
  }

  private async executeBySearchType(
    searchType: string,
    params: DataSourceParams,
    config: ProviderConfig,
    runtimeConfig: AmazonProviderConfig,
  ): Promise<NormalizedMarketData> {
    const timeoutMs = config.timeoutMs ?? runtimeConfig.timeoutMs;
    const marketplace = runtimeConfig.marketplace;

    if (searchType === AMAZON_SEARCH_TYPE.METADATA) {
      return this.fetchMetadata(params, runtimeConfig, timeoutMs, marketplace);
    }

    return this.fetchSearchResults(searchType, params, runtimeConfig, timeoutMs, marketplace);
  }

  private async fetchSearchResults(
    searchType: string,
    params: DataSourceParams,
    config: AmazonProviderConfig,
    timeoutMs: number,
    marketplace: string,
  ): Promise<NormalizedMarketData> {
    const options = params.options ?? {};
    const itemCount = Number(options.itemCount ?? AMAZON_DEFAULT_ITEM_COUNT);
    const page = options.page as number | undefined;
    const sortBy = (options.sortBy as string | undefined) ?? AMAZON_SEARCH_TYPE_SORT_MAP[searchType];
    const keywords = this.resolveKeywords(params, searchType);
    const browseNodeId = this.resolveBrowseNodeId(params);

    const request: AmazonSearchItemsRequest = {
      PartnerTag: config.partnerTag,
      PartnerType: AMAZON_PARTNER_TYPE,
      Marketplace: marketplace,
      SearchIndex: AMAZON_BOOKS_SEARCH_INDEX,
      ItemCount: itemCount,
      SortBy: sortBy,
      Resources: AMAZON_ITEM_RESOURCES,
    };

    if (keywords) request.Keywords = keywords;
    if (browseNodeId) request.BrowseNodeId = browseNodeId;
    if (page !== undefined) request.ItemPage = page;
    if (params.language) request.LanguagesOfPreference = [params.language];

    const response = await this.adapter.searchItems(request, config, timeoutMs);

    if (response.Errors && response.Errors.length > 0) {
      throw AmazonProviderExceptionHandler.fromApiErrors(response.Errors);
    }

    return this.mapper.mapSearchResponse(response, searchType, marketplace);
  }

  private async fetchMetadata(
    params: DataSourceParams,
    config: AmazonProviderConfig,
    timeoutMs: number,
    marketplace: string,
  ): Promise<NormalizedMarketData> {
    const options = params.options ?? {};
    const asins = options.asins as string[];

    const request: AmazonGetItemsRequest = {
      PartnerTag: config.partnerTag,
      PartnerType: AMAZON_PARTNER_TYPE,
      Marketplace: marketplace,
      ItemIds: asins,
      Resources: AMAZON_ITEM_RESOURCES,
    };

    if (params.language) request.LanguagesOfPreference = [params.language];

    const response = await this.adapter.getItems(request, config, timeoutMs);

    if (response.Errors && response.Errors.length > 0) {
      throw AmazonProviderExceptionHandler.fromApiErrors(response.Errors);
    }

    return this.mapper.mapGetItemsResponse(response, AMAZON_SEARCH_TYPE.METADATA, marketplace);
  }

  private resolveKeywords(params: DataSourceParams, searchType: string): string | undefined {
    if (
      searchType === AMAZON_SEARCH_TYPE.CATEGORY ||
      searchType === AMAZON_SEARCH_TYPE.TRENDING ||
      searchType === AMAZON_SEARCH_TYPE.BEST_SELLERS ||
      searchType === AMAZON_SEARCH_TYPE.NEW_RELEASES
    ) {
      return undefined;
    }

    const options = params.options ?? {};
    if (typeof options.keywords === 'string') return options.keywords;
    if (params.keywords?.length) return params.keywords.join(' ');
    if (params.genre) return params.genre;
    return undefined;
  }

  private resolveBrowseNodeId(params: DataSourceParams): string | undefined {
    const options = params.options ?? {};
    if (typeof options.browseNodeId === 'string') return options.browseNodeId;
    return undefined;
  }

  private resolveRuntimeConfig(config: ProviderConfig): AmazonProviderConfig {
    const custom = config.customConfig ?? {};
    return {
      accessKey: (custom.accessKey as string | undefined) ?? this.amazonConfig.accessKey,
      secretKey: (custom.secretKey as string | undefined) ?? this.amazonConfig.secretKey,
      partnerTag: (custom.partnerTag as string | undefined) ?? this.amazonConfig.partnerTag,
      host: (custom.host as string | undefined) ?? this.amazonConfig.host,
      region: (custom.region as string | undefined) ?? this.amazonConfig.region,
      marketplace: (custom.marketplace as string | undefined) ?? this.amazonConfig.marketplace,
      timeoutMs: (custom.timeoutMs as number | undefined) ?? this.amazonConfig.timeoutMs,
      maxRetries: config.maxRetries ?? this.amazonConfig.maxRetries,
      retryDelayMs: config.retryDelayMs ?? this.amazonConfig.retryDelayMs,
      useMock: (custom.useMock as boolean | undefined) ?? this.amazonConfig.useMock,
    };
  }
}

export { AmazonMarketplaceProvider as AmazonProvider };

