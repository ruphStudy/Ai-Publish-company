import type { DashboardFilters } from '@/features/analytics-dashboard';
import type { ExecutiveDashboardResponse, ExecutiveKPIItem } from '../types';

export function executiveUnavailableResponse(): ExecutiveDashboardResponse {
  return {
    kpis: { items: [] },
    portfolioHealth: { overallScore: null, overallStatus: 'UNKNOWN', dimensions: [] },
    trend: { series: [] },
    topBooks: [],
    underperformingBooks: [],
    providers: [],
    marketplaces: [],
    geographies: [],
    formats: [],
    opportunities: [],
    insights: [],
    risks: [],
    alerts: [],
    activity: [],
    freshness: [],
    warnings: [],
    metadata: { dataCompleteness: { status: 'UNKNOWN', message: 'Executive aggregates are not available from the current backend contract.' } },
  };
}

export function mapExecutiveKPIs(items?: ExecutiveKPIItem[], filters?: DashboardFilters): ExecutiveKPIItem[] {
  const currency = filters?.currencyCode ?? 'USD';
  return (items ?? []).map((item) => ({ ...item, currency: item.currency ?? currency }));
}

export function sanitizeExecutiveSearch(value?: string) {
  return value?.replace(/[<>]/g, '').trim();
}
