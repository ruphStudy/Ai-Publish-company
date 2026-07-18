import { Inject, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type {
  TrendHistoryConfig} from './config/trend-history.config';
import {
  TREND_HISTORY_CONFIG_TOKEN
} from './config/trend-history.config';
import { TrendHistory } from './entities/trend-history.entity';
import {
  TrendComparisonResult,
  TrendMetricChange,
} from './models/trend-history.model';

@Injectable()
export class TrendComparisonEngine {
  constructor(
    @Inject(TREND_HISTORY_CONFIG_TOKEN)
    private readonly config: TrendHistoryConfig,
  ) {}

  compare(
    previous: TrendHistory,
    current: TrendHistory,
  ): TrendComparisonResult {
    const changes = [
      this.createChange('trendScore', previous.trendScore, current.trendScore),
      this.createChange(
        'opportunityScore',
        previous.opportunityScore,
        current.opportunityScore,
      ),
      this.createChange(
        'demandScore',
        previous.demandScore,
        current.demandScore,
      ),
      this.createChange(
        'competitionScore',
        previous.competitionScore,
        current.competitionScore,
      ),
      this.createChange(
        'searchVolume',
        previous.searchVolume,
        current.searchVolume,
      ),
      this.createChange('rating', previous.rating, current.rating),
      this.createChange('reviewCount', previous.reviewCount, current.reviewCount),
      this.createChange('price', previous.price, current.price),
    ];

    return {
      knowledgeRecordId: (current.knowledgeRecordId as Types.ObjectId).toString(),
      previousSnapshotId: (previous._id as Types.ObjectId).toString(),
      currentSnapshotId: (current._id as Types.ObjectId).toString(),
      comparedAt: new Date(),
      changes,
      significantChanges: changes.filter((change) => change.isSignificant),
    };
  }

  private createChange(
    field: string,
    previousValue: number | null,
    currentValue: number | null,
  ): TrendMetricChange {
    if (previousValue === null || currentValue === null) {
      return {
        field,
        previousValue,
        currentValue,
        absoluteChange: null,
        percentageChange: null,
        isSignificant: false,
      };
    }

    const absoluteChange = currentValue - previousValue;
    const percentageChange =
      previousValue === 0
        ? currentValue === 0
          ? 0
          : 100
        : Number(((absoluteChange / Math.abs(previousValue)) * 100).toFixed(2));

    return {
      field,
      previousValue,
      currentValue,
      absoluteChange,
      percentageChange,
      isSignificant:
        Math.abs(percentageChange) >= this.config.significantChangePercentage,
    };
  }
}