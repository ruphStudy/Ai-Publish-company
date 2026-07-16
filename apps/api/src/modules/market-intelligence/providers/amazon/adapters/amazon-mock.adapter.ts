import { Injectable, Logger } from '@nestjs/common';

import { AmazonProviderConfig } from '../config/amazon-provider.config';
import {
  AmazonSearchItemsRequest,
  AmazonGetItemsRequest,
  AmazonSearchItemsResponse,
  AmazonGetItemsResponse,
  AmazonItem,
} from '../interfaces/amazon.interface';
import { IAmazonProviderAdapter } from './amazon-provider-adapter.interface';
import { MOCK_DELAY_MS, AMAZON_SORT_BY } from '../constants/amazon.constants';
import {
  MOCK_BOOK_FIXTURES,
  MOCK_BEST_SELLER_ASINS,
  MOCK_TRENDING_ASINS,
  MOCK_NEW_RELEASES_ASINS,
} from '../mock/amazon-mock.fixtures';

@Injectable()
export class AmazonMockProviderAdapter implements IAmazonProviderAdapter {
  private readonly logger = new Logger(AmazonMockProviderAdapter.name);

  async searchItems(
    request: AmazonSearchItemsRequest,
    _config: AmazonProviderConfig,
    _timeoutMs: number,
  ): Promise<AmazonSearchItemsResponse> {
    await this.simulateLatency();

    this.logger.debug('AmazonMockProviderAdapter.searchItems', {
      keywords: request.Keywords,
      browseNodeId: request.BrowseNodeId,
      sortBy: request.SortBy,
      itemCount: request.ItemCount,
    });

    const items = this.resolveSearchItems(request);

    return {
      SearchResult: {
        Items: items,
        TotalResultCount: items.length,
      },
    };
  }

  async getItems(
    request: AmazonGetItemsRequest,
    _config: AmazonProviderConfig,
    _timeoutMs: number,
  ): Promise<AmazonGetItemsResponse> {
    await this.simulateLatency();

    this.logger.debug('AmazonMockProviderAdapter.getItems', {
      itemIds: request.ItemIds,
    });

    const items = MOCK_BOOK_FIXTURES.filter((item) =>
      request.ItemIds.includes(item.ASIN ?? ''),
    );

    return {
      ItemsResult: { Items: items },
    };
  }

  private resolveSearchItems(request: AmazonSearchItemsRequest): AmazonItem[] {
    let pool: AmazonItem[];

    if (request.SortBy === AMAZON_SORT_BY.FEATURED) {
      const isTrending = !request.Keywords && !request.BrowseNodeId;
      const asinList = isTrending ? MOCK_TRENDING_ASINS : MOCK_BEST_SELLER_ASINS;
      pool = this.filterByAsinList(asinList);
    } else if (request.SortBy === AMAZON_SORT_BY.NEWEST_ARRIVALS) {
      pool = this.filterByAsinList(MOCK_NEW_RELEASES_ASINS);
    } else {
      pool = [...MOCK_BOOK_FIXTURES];
    }

    if (request.BrowseNodeId) {
      pool = pool.filter((item) =>
        item.BrowseNodeInfo?.BrowseNodes?.some(
          (node) => node.Id === request.BrowseNodeId,
        ),
      );
    }

    if (request.Keywords) {
      const terms = request.Keywords.toLowerCase().split(/\s+/);
      pool = pool.filter((item) => {
        const text = [
          item.ItemInfo?.Title?.DisplayValue ?? '',
          ...(item.ItemInfo?.Features?.DisplayValues ?? []),
          item.BrowseNodeInfo?.BrowseNodes?.[0]?.DisplayName ?? '',
          item.ItemInfo?.ByLineInfo?.Contributors?.map((c) => c.Name ?? '').join(' ') ?? '',
        ]
          .join(' ')
          .toLowerCase();
        return terms.some((term) => text.includes(term));
      });
    }

    pool = this.applySortOrder(pool, request.SortBy);

    const page = request.ItemPage ?? 1;
    const count = request.ItemCount;
    const offset = (page - 1) * count;
    return pool.slice(offset, offset + count);
  }

  private applySortOrder(items: AmazonItem[], sortBy?: string): AmazonItem[] {
    if (sortBy === AMAZON_SORT_BY.NEWEST_ARRIVALS) {
      return [...items].sort((a, b) => {
        const da = a.ItemInfo?.ContentInfo?.PublicationDate?.DisplayValue ?? '';
        const db = b.ItemInfo?.ContentInfo?.PublicationDate?.DisplayValue ?? '';
        return db.localeCompare(da);
      });
    }

    if (sortBy === AMAZON_SORT_BY.AVG_CUSTOMER_REVIEWS) {
      return [...items].sort(
        (a, b) =>
          (b.CustomerReviews?.StarRating?.Value ?? 0) -
          (a.CustomerReviews?.StarRating?.Value ?? 0),
      );
    }

    if (sortBy === AMAZON_SORT_BY.PRICE_LOW_TO_HIGH) {
      return [...items].sort(
        (a, b) =>
          (a.Offers?.Listings?.[0]?.Price?.Amount ?? 0) -
          (b.Offers?.Listings?.[0]?.Price?.Amount ?? 0),
      );
    }

    if (sortBy === AMAZON_SORT_BY.PRICE_HIGH_TO_LOW) {
      return [...items].sort(
        (a, b) =>
          (b.Offers?.Listings?.[0]?.Price?.Amount ?? 0) -
          (a.Offers?.Listings?.[0]?.Price?.Amount ?? 0),
      );
    }

    return [...items].sort(
      (a, b) =>
        (a.BrowseNodeInfo?.WebsiteSalesRank?.SalesRank ?? 9999) -
        (b.BrowseNodeInfo?.WebsiteSalesRank?.SalesRank ?? 9999),
    );
  }

  private filterByAsinList(asinList: string[]): AmazonItem[] {
    const indexMap = new Map(asinList.map((asin, i) => [asin, i]));
    return MOCK_BOOK_FIXTURES.filter((item) => indexMap.has(item.ASIN ?? ''))
      .sort(
        (a, b) =>
          (indexMap.get(a.ASIN ?? '') ?? 999) - (indexMap.get(b.ASIN ?? '') ?? 999),
      );
  }

  private simulateLatency(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  }
}
