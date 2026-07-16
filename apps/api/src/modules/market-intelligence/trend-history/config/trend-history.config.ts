export interface TrendHistoryConfig {
  snapshotVersion: string;
  significantChangePercentage: number;
  maximumBulkSnapshotSize: number;
}

export const TREND_HISTORY_CONFIG_TOKEN = 'TREND_HISTORY_CONFIG';

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadTrendHistoryConfig(): TrendHistoryConfig {
  return {
    snapshotVersion: process.env.TREND_HISTORY_SNAPSHOT_VERSION ?? '1.0.0',
    significantChangePercentage: parsePositiveNumber(
      process.env.TREND_HISTORY_SIGNIFICANT_CHANGE_PERCENTAGE,
      15,
    ),
    maximumBulkSnapshotSize: parsePositiveInteger(
      process.env.TREND_HISTORY_MAXIMUM_BULK_SNAPSHOT_SIZE,
      100,
    ),
  };
}