import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsComparisonService {
  compare(current: Record<string, unknown>, previous: Record<string, unknown>) { return Object.fromEntries(Object.entries(current).filter(([, value]) => typeof value === 'number').map(([key, value]) => { const c = Number(value); const p = Number(previous[key] ?? 0); return [key, { currentValue: c, previousValue: p, absoluteChange: c - p, percentageChange: p === 0 ? null : ((c - p) / Math.abs(p)) * 100, trendDirection: c > p ? 'UP' : c < p ? 'DOWN' : 'FLAT', comparable: p !== 0, comparisonReason: p === 0 ? 'Previous value is zero' : undefined }]; })); }
}
