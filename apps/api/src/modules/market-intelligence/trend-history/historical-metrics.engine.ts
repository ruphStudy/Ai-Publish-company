import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { TrendHistory } from './entities/trend-history.entity';
import {
  HistoricalMetricStatistics,
  HistoricalStatisticsResult,
} from './models/trend-history.model';

@Injectable()
export class HistoricalMetricsEngine {
  calculate(snapshots: TrendHistory[]): HistoricalStatisticsResult {
    const orderedSnapshots = [...snapshots].sort(
      (left, right) =>
        left.snapshotDate.getTime() - right.snapshotDate.getTime(),
    );
    const knowledgeRecordId =
      orderedSnapshots.length > 0
        ? (orderedSnapshots[0].knowledgeRecordId as Types.ObjectId).toString()
        : '';

    return {
      knowledgeRecordId,
      snapshotCount: orderedSnapshots.length,
      firstSnapshotDate: orderedSnapshots[0]?.snapshotDate ?? null,
      lastSnapshotDate: orderedSnapshots.at(-1)?.snapshotDate ?? null,
      metrics: [
        this.calculateMetric('trendScore', orderedSnapshots),
        this.calculateMetric('opportunityScore', orderedSnapshots),
        this.calculateMetric('demandScore', orderedSnapshots),
        this.calculateMetric('competitionScore', orderedSnapshots),
        this.calculateMetric('searchVolume', orderedSnapshots),
        this.calculateMetric('rating', orderedSnapshots),
        this.calculateMetric('reviewCount', orderedSnapshots),
        this.calculateMetric('price', orderedSnapshots),
      ],
    };
  }

  private calculateMetric(
    metric: keyof Pick<
      TrendHistory,
      | 'trendScore'
      | 'opportunityScore'
      | 'demandScore'
      | 'competitionScore'
      | 'searchVolume'
      | 'rating'
      | 'reviewCount'
      | 'price'
    >,
    snapshots: TrendHistory[],
  ): HistoricalMetricStatistics {
    const values = snapshots
      .map((snapshot) => snapshot[metric])
      .filter((value): value is number => value !== null);

    if (values.length === 0) {
      return {
        metric,
        minimum: null,
        maximum: null,
        average: null,
        latest: null,
        oldest: null,
        change: null,
        percentageChange: null,
      };
    }

    const oldest = values[0];
    const latest = values.at(-1) ?? null;
    const change = latest === null ? null : latest - oldest;
    const percentageChange =
      change === null
        ? null
        : oldest === 0
          ? latest === 0
            ? 0
            : 100
          : Number(((change / Math.abs(oldest)) * 100).toFixed(2));

    return {
      metric,
      minimum: Math.min(...values),
      maximum: Math.max(...values),
      average: Number(
        (values.reduce((total, value) => total + value, 0) / values.length).toFixed(
          2,
        ),
      ),
      latest,
      oldest,
      change,
      percentageChange,
    };
  }
}