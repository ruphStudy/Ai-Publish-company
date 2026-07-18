import { Injectable } from '@nestjs/common';
import { AnalyticsPeriod } from './entities/book-analytics.entity';
import type { AnalyticsPeriodRange } from './interfaces/book-analytics.interface';

@Injectable()
export class AnalyticsPeriodResolver {
  resolve(period: AnalyticsPeriod, from?: Date, to?: Date): AnalyticsPeriodRange {
    const now = new Date(); const end = new Date(now); const start = new Date(now);
    if (period === AnalyticsPeriod.CUSTOM && from && to) return this.withComparison(period, from, to);
    if (period === AnalyticsPeriod.LIFETIME) return this.withComparison(period, new Date('1970-01-01T00:00:00.000Z'), end);
    const days: Record<string, number> = { TODAY: 0, YESTERDAY: 1, LAST_7_DAYS: 6, LAST_30_DAYS: 29, LAST_90_DAYS: 89 };
    if (period === AnalyticsPeriod.YESTERDAY) { start.setUTCDate(start.getUTCDate() - 1); end.setUTCDate(end.getUTCDate() - 1); }
    else start.setUTCDate(start.getUTCDate() - (days[period] ?? 29));
    start.setUTCHours(0, 0, 0, 0); end.setUTCHours(23, 59, 59, 999);
    return this.withComparison(period, start, end);
  }
  private withComparison(periodType: AnalyticsPeriod, periodStart: Date, periodEnd: Date): AnalyticsPeriodRange { const ms = periodEnd.getTime() - periodStart.getTime(); return { periodType, periodStart, periodEnd, comparisonPeriodStart: new Date(periodStart.getTime() - ms - 1), comparisonPeriodEnd: new Date(periodStart.getTime() - 1) }; }
}
