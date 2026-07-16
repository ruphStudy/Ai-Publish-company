import { Injectable } from '@nestjs/common';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderResponse } from '../../providers/interfaces/provider.interface';
import {
  NormalizedBook,
  NormalizedMarketData,
} from '../../providers/amazon/interfaces/amazon.interface';
import { ProviderNormalizationStrategy } from '../interfaces/provider-normalization-strategy.interface';
import {
  UnifiedMarketIntelligenceModel,
  UnifiedTrendDirection,
} from '../models/unified-market-intelligence.model';

@Injectable()
export class AmazonNormalizationStrategy implements ProviderNormalizationStrategy {
  readonly provider = DataSourceProvider.AMAZON_KDP;

  async normalize(
    response: ProviderResponse<unknown>,
  ): Promise<UnifiedMarketIntelligenceModel[]> {
    if (!this.isNormalizedMarketData(response.data)) {
      return [];
    }

    return response.data.books.map((book) => this.toUnifiedModel(book, response));
  }

  private toUnifiedModel(
    book: NormalizedBook,
    response: ProviderResponse<unknown>,
  ): UnifiedMarketIntelligenceModel {
    return {
      provider: this.provider,
      externalId: book.providerBookId || book.asin,
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      category: book.category,
      subCategory: book.subcategory,
      description: book.description,
      keywords: book.keywords,
      language: book.language,
      price: book.price,
      currency: book.currency,
      rating: book.rating,
      reviewCount: book.reviewCount,
      trendScore: null,
      trendDirection: null,
      searchVolume: null,
      publishDate: book.publicationDate,
      publisher: book.publisher,
      format: book.format,
      sourceUrl: book.sourceUrl,
      coverImage: book.coverImage,
      collectedAt: book.collectedAt || response.fetchedAt.toISOString(),
      metadata: {
        asin: book.asin,
        authors: book.authors,
        salesRank: book.salesRank,
        providerKey: response.key,
        providerVersion: response.version,
        providerMetadata: response.metadata,
      },
    };
  }

  private isNormalizedMarketData(value: unknown): value is NormalizedMarketData {
    if (!this.isRecord(value) || !Array.isArray(value.books)) {
      return false;
    }

    return value.books.every((book) => this.isRecord(book));
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}