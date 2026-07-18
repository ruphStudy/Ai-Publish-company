import { Injectable } from '@nestjs/common';
import { coreAnalyticsMetrics } from './config/book-analytics.config';

@Injectable()
export class AnalyticsMetricRegistry {
  all() { return coreAnalyticsMetrics.filter((metric) => metric.enabled); }
  get(metricKey: string) { return this.all().find((metric) => metric.metricKey === metricKey) ?? null; }
}
