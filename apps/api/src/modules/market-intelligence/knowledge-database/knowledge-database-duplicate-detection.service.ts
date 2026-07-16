import { Injectable } from '@nestjs/common';

import { UnifiedMarketIntelligenceModel } from '../data-normalizer/models/unified-market-intelligence.model';

export interface KnowledgeDatabaseDuplicateDetectionResult {
  records: UnifiedMarketIntelligenceModel[];
  duplicateCount: number;
}

@Injectable()
export class KnowledgeDatabaseDuplicateDetectionService {
  removeDuplicates(
    records: UnifiedMarketIntelligenceModel[],
  ): KnowledgeDatabaseDuplicateDetectionResult {
    const uniqueRecords = new Map<string, UnifiedMarketIntelligenceModel>();
    let duplicateCount = 0;

    for (const record of records) {
      const key = this.buildIdentityKey(record);
      const existing = uniqueRecords.get(key);

      if (!existing) {
        uniqueRecords.set(key, record);
        continue;
      }

      duplicateCount += 1;

      if (this.isMoreRecent(record, existing)) {
        uniqueRecords.set(key, record);
      }
    }

    return {
      records: Array.from(uniqueRecords.values()),
      duplicateCount,
    };
  }

  buildIdentityKey(record: UnifiedMarketIntelligenceModel): string {
    return `${record.provider}:${record.externalId}`.trim().toLowerCase();
  }

  private isMoreRecent(
    candidate: UnifiedMarketIntelligenceModel,
    existing: UnifiedMarketIntelligenceModel,
  ): boolean {
    return (
      new Date(candidate.collectedAt).getTime() >
      new Date(existing.collectedAt).getTime()
    );
  }
}