import { Injectable } from '@nestjs/common';

import { UnifiedMarketIntelligenceModel } from '../models/unified-market-intelligence.model';

export interface DuplicateDetectionResult {
  records: UnifiedMarketIntelligenceModel[];
  duplicateCount: number;
}

@Injectable()
export class DuplicateDetectionService {
  removeDuplicates(
    records: UnifiedMarketIntelligenceModel[],
  ): DuplicateDetectionResult {
    const uniqueRecords = new Map<string, UnifiedMarketIntelligenceModel>();
    let duplicateCount = 0;

    for (const record of records) {
      const key = this.buildKey(record);
      const existing = uniqueRecords.get(key);

      if (!existing) {
        uniqueRecords.set(key, record);
        continue;
      }

      duplicateCount += 1;

      if (this.getCompletenessScore(record) > this.getCompletenessScore(existing)) {
        uniqueRecords.set(key, record);
      }
    }

    return {
      records: Array.from(uniqueRecords.values()),
      duplicateCount,
    };
  }

  private buildKey(record: UnifiedMarketIntelligenceModel): string {
    return `${record.provider}:${record.externalId}`.toLowerCase().trim();
  }

  private getCompletenessScore(record: UnifiedMarketIntelligenceModel): number {
    return [
      record.subtitle,
      record.author,
      record.category,
      record.subCategory,
      record.description,
      record.language,
      record.price,
      record.currency,
      record.rating,
      record.reviewCount,
      record.trendScore,
      record.searchVolume,
      record.publishDate,
      record.publisher,
      record.format,
      record.sourceUrl,
      record.coverImage,
    ].filter((value) => value !== null && value !== undefined).length;
  }
}