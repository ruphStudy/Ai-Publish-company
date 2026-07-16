import { Injectable } from '@nestjs/common';

import { TrendHistory } from './entities/trend-history.entity';
import { HistoricalMetricsEngine } from './historical-metrics.engine';
import { HistoricalStatisticsResult } from './models/trend-history.model';
import { TrendComparisonEngine } from './trend-comparison.engine';

@Injectable()
export class TrendHistoryEngine {
  constructor(
    private readonly comparisonEngine: TrendComparisonEngine,
    private readonly historicalMetricsEngine: HistoricalMetricsEngine,
  ) {}

  compare(previous: TrendHistory, current: TrendHistory) {
    return this.comparisonEngine.compare(previous, current);
  }

  calculateStatistics(snapshots: TrendHistory[]): HistoricalStatisticsResult {
    return this.historicalMetricsEngine.calculate(snapshots);
  }
}