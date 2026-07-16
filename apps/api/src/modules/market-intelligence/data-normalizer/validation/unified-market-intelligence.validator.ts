import { Injectable } from '@nestjs/common';

import { UnifiedMarketIntelligenceModel } from '../models/unified-market-intelligence.model';

export interface UnifiedMarketIntelligenceValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class UnifiedMarketIntelligenceValidator {
  validate(
    record: UnifiedMarketIntelligenceModel,
  ): UnifiedMarketIntelligenceValidationResult {
    const errors: string[] = [];

    if (!record.provider) {
      errors.push('provider is required');
    }

    if (!record.externalId) {
      errors.push('externalId is required');
    }

    if (!record.title) {
      errors.push('title is required');
    }

    if (!record.collectedAt || Number.isNaN(new Date(record.collectedAt).getTime())) {
      errors.push('collectedAt must be a valid ISO date');
    }

    if (record.price !== null && !record.currency) {
      errors.push('currency is required when price is present');
    }

    if (record.rating !== null && (record.rating < 0 || record.rating > 5)) {
      errors.push('rating must be between 0 and 5');
    }

    if (
      record.trendScore !== null &&
      (record.trendScore < 0 || record.trendScore > 100)
    ) {
      errors.push('trendScore must be between 0 and 100');
    }

    if (record.reviewCount !== null && record.reviewCount < 0) {
      errors.push('reviewCount cannot be negative');
    }

    if (record.searchVolume !== null && record.searchVolume < 0) {
      errors.push('searchVolume cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}