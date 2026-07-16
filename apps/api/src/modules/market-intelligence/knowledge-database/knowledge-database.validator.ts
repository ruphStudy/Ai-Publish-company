import { Injectable } from '@nestjs/common';

import { DataSourceProvider } from '../entities/market-intelligence.entity';
import { UnifiedMarketIntelligenceModel } from '../data-normalizer/models/unified-market-intelligence.model';

export interface KnowledgeDatabaseValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class KnowledgeDatabaseValidator {
  validate(
    model: UnifiedMarketIntelligenceModel,
  ): KnowledgeDatabaseValidationResult {
    const errors: string[] = [];

    if (!Object.values(DataSourceProvider).includes(model.provider)) {
      errors.push('provider must be a valid DataSourceProvider');
    }

    if (!model.externalId?.trim()) {
      errors.push('externalId is required');
    }

    if (!model.title?.trim()) {
      errors.push('title is required');
    }

    if (!this.isValidDate(model.collectedAt)) {
      errors.push('collectedAt must be a valid ISO date');
    }

    if (model.publishDate && !this.isValidDate(model.publishDate)) {
      errors.push('publishDate must be a valid ISO date');
    }

    if (model.price !== null && (!Number.isFinite(model.price) || model.price < 0)) {
      errors.push('price must be a non-negative number');
    }

    if (model.price !== null && !model.currency) {
      errors.push('currency is required when price is present');
    }

    if (
      model.rating !== null &&
      (!Number.isFinite(model.rating) || model.rating < 0 || model.rating > 5)
    ) {
      errors.push('rating must be between 0 and 5');
    }

    if (
      model.reviewCount !== null &&
      (!Number.isInteger(model.reviewCount) || model.reviewCount < 0)
    ) {
      errors.push('reviewCount must be a non-negative integer');
    }

    if (
      model.trendScore !== null &&
      (!Number.isFinite(model.trendScore) ||
        model.trendScore < 0 ||
        model.trendScore > 100)
    ) {
      errors.push('trendScore must be between 0 and 100');
    }

    if (
      model.searchVolume !== null &&
      (!Number.isInteger(model.searchVolume) || model.searchVolume < 0)
    ) {
      errors.push('searchVolume must be a non-negative integer');
    }

    if (!this.isValidMetadata(model.metadata)) {
      errors.push('metadata must be a valid JSON-compatible object');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidDate(value: string): boolean {
    return !Number.isNaN(new Date(value).getTime());
  }

  private isValidMetadata(value: Record<string, unknown>): boolean {
    try {
      JSON.stringify(value);
      return this.isJsonCompatible(value);
    } catch {
      return false;
    }
  }

  private isJsonCompatible(value: unknown): boolean {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      typeof value === 'number'
    ) {
      return true;
    }

    if (Array.isArray(value)) {
      return value.every((item) => this.isJsonCompatible(item));
    }

    if (typeof value === 'object') {
      return Object.values(value as Record<string, unknown>).every((item) =>
        this.isJsonCompatible(item),
      );
    }

    return false;
  }
}