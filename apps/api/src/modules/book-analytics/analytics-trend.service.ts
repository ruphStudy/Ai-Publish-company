import { Injectable } from '@nestjs/common';
import type { CanonicalSalesDocument } from '../sales-royalty-normalization/entities/canonical-sales.entity';
import { AnalyticsGranularity } from './entities/book-analytics.entity';

@Injectable()
export class AnalyticsTrendService {
  salesTrend(sales: CanonicalSalesDocument[], metricKey: string, granularity = AnalyticsGranularity.DAY) { void granularity; return Object.values(sales.reduce<Record<string, { periodStart: Date; periodEnd: Date; metricKey: string; value: number; previousValue: null; absoluteChange: null; percentageChange: null; dataCompleteness: number; currencyCode: string }>>((acc, sale) => { const key = sale.saleDateUtc.toISOString().slice(0, 10); acc[key] ??= { periodStart: new Date(`${key}T00:00:00.000Z`), periodEnd: new Date(`${key}T23:59:59.999Z`), metricKey, value: 0, previousValue: null, absoluteChange: null, percentageChange: null, dataCompleteness: 1, currencyCode: sale.currencyCode }; acc[key].value += Number(metricKey === 'unitsSold' ? sale.quantity : sale.netAmount); return acc; }, {})); }
}
