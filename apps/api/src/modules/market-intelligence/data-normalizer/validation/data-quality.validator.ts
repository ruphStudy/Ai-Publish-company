import { Inject, Injectable } from '@nestjs/common';

import {
  DATA_NORMALIZER_CONFIG_TOKEN,
  DataNormalizerConfig,
} from '../config/data-normalizer.config';
import {
  UnifiedMarketIntelligenceModel,
  UnifiedTrendDirection,
} from '../models/unified-market-intelligence.model';

@Injectable()
export class DataQualityValidator {
  constructor(
    @Inject(DATA_NORMALIZER_CONFIG_TOKEN)
    private readonly config: DataNormalizerConfig,
  ) {}

  normalize(
    record: UnifiedMarketIntelligenceModel,
  ): UnifiedMarketIntelligenceModel {
    return {
      ...record,
      externalId: this.normalizeText(record.externalId),
      title: this.normalizeText(record.title),
      subtitle: this.normalizeNullableText(record.subtitle),
      author: this.normalizeNullableText(record.author),
      category: this.normalizeCategory(record.category),
      subCategory: this.normalizeCategory(record.subCategory),
      description: this.normalizeNullableText(record.description),
      keywords: this.normalizeKeywords(record.keywords),
      language: this.normalizeLanguage(record.language),
      price: this.normalizeNumber(record.price, 0),
      currency: this.normalizeCurrency(record.currency),
      rating: this.normalizeRating(record.rating),
      reviewCount: this.normalizeInteger(record.reviewCount, 0),
      trendScore: this.normalizeScore(record.trendScore),
      trendDirection: this.normalizeTrendDirection(record.trendDirection),
      searchVolume: this.normalizeInteger(record.searchVolume, 0),
      publishDate: this.normalizeDate(record.publishDate),
      publisher: this.normalizeNullableText(record.publisher),
      format: this.normalizeNullableText(record.format),
      sourceUrl: this.normalizeUrl(record.sourceUrl),
      coverImage: this.normalizeUrl(record.coverImage),
      collectedAt: this.normalizeDate(record.collectedAt) ?? new Date().toISOString(),
      metadata: this.normalizeMetadata(record.metadata, 0),
    };
  }

  private normalizeText(value: string): string {
    return value.replace(/\s+/g, ' ').trim().slice(0, this.config.maxStringLength);
  }

  private normalizeNullableText(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = this.normalizeText(value);
    return normalized.length > 0 ? normalized : null;
  }

  private normalizeCategory(value: string | null): string | null {
    const normalized = this.normalizeNullableText(value);

    if (!normalized) {
      return null;
    }

    return normalized
      .split(' ')
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
      .join(' ');
  }

  private normalizeKeywords(values: string[]): string[] {
    const normalized = values
      .filter((value): value is string => typeof value === 'string')
      .map((value) => this.normalizeText(value).toLowerCase())
      .filter((value) => value.length > 0)
      .map((value) => value.slice(0, this.config.maxKeywordLength));

    return [...new Set(normalized)].slice(0, this.config.maxKeywords);
  }

  private normalizeLanguage(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = this.normalizeText(value).toLowerCase();
    const languageMap: Record<string, string> = {
      english: 'en',
      spanish: 'es',
      french: 'fr',
      german: 'de',
      italian: 'it',
      portuguese: 'pt',
      hindi: 'hi',
      japanese: 'ja',
      korean: 'ko',
      chinese: 'zh',
    };

    if (languageMap[normalized]) {
      return languageMap[normalized];
    }

    if (/^[a-z]{2}$/.test(normalized)) {
      return normalized;
    }

    if (/^[a-z]{3}$/.test(normalized)) {
      return normalized;
    }

    return null;
  }

  private normalizeCurrency(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const normalized = this.normalizeText(value).toUpperCase();
    const currencyMap: Record<string, string> = {
      '$': 'USD',
      '£': 'GBP',
      '€': 'EUR',
      '₹': 'INR',
      USD: 'USD',
      GBP: 'GBP',
      EUR: 'EUR',
      INR: 'INR',
      CAD: 'CAD',
      AUD: 'AUD',
      JPY: 'JPY',
    };

    return currencyMap[normalized] ?? null;
  }

  private normalizeRating(value: number | null): number | null {
    const normalized = this.normalizeNumber(value, 0);

    if (normalized === null) {
      return null;
    }

    return Math.min(5, Math.max(0, normalized));
  }

  private normalizeScore(value: number | null): number | null {
    const normalized = this.normalizeNumber(value, 0);

    if (normalized === null) {
      return null;
    }

    return Math.min(100, Math.max(0, normalized));
  }

  private normalizeNumber(value: number | null, minimum: number): number | null {
    if (value === null || value === undefined || !Number.isFinite(value)) {
      return null;
    }

    return value >= minimum ? value : null;
  }

  private normalizeInteger(value: number | null, minimum: number): number | null {
    const normalized = this.normalizeNumber(value, minimum);

    if (normalized === null) {
      return null;
    }

    return Math.floor(normalized);
  }

  private normalizeTrendDirection(
    value: UnifiedTrendDirection | null,
  ): UnifiedTrendDirection | null {
    if (
      value === UnifiedTrendDirection.RISING ||
      value === UnifiedTrendDirection.STABLE ||
      value === UnifiedTrendDirection.DECLINING
    ) {
      return value;
    }

    return null;
  }

  private normalizeDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toISOString();
  }

  private normalizeUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    try {
      return new URL(value).toString();
    } catch {
      return null;
    }
  }

  private normalizeMetadata(
    value: Record<string, unknown>,
    depth: number,
  ): Record<string, unknown> {
    if (depth >= this.config.maxMetadataDepth) {
      return {};
    }

    return Object.entries(value)
      .slice(0, this.config.maxMetadataEntries)
      .reduce<Record<string, unknown>>((metadata, [key, item]) => {
        const normalizedKey = this.normalizeText(key);

        if (!normalizedKey) {
          return metadata;
        }

        const normalizedValue = this.normalizeMetadataValue(item, depth + 1);

        if (normalizedValue !== undefined) {
          metadata[normalizedKey] = normalizedValue;
        }

        return metadata;
      }, {});
  }

  private normalizeMetadataValue(value: unknown, depth: number): unknown {
    if (value === null || typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      return this.normalizeText(value);
    }

    if (Array.isArray(value)) {
      return value
        .slice(0, this.config.maxMetadataArrayItems)
        .map((item) => this.normalizeMetadataValue(item, depth + 1))
        .filter((item) => item !== undefined);
    }

    if (this.isRecord(value)) {
      return this.normalizeMetadata(value, depth + 1);
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}