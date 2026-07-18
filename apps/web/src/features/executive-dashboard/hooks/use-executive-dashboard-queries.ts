import { useMemo } from 'react';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import { mapExecutiveKPIs } from '../lib/executive-dashboard-mappers';
import type { ExecutiveDashboardResponse } from '../types';

const EMPTY_EXECUTIVE_DASHBOARD: ExecutiveDashboardResponse = {
  kpis: { items: [] },
  portfolioHealth: { overallStatus: 'UNKNOWN', dimensions: [] },
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
};

function useExecutiveSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'executive-overview', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId, filters }, endpoint, enabled);
}

export function useExecutiveDashboard(filters: DashboardFilters) {
  const query = useExecutiveSection<ExecutiveDashboardResponse>('executive-dashboard', filters, '/dashboard/analytics/executive');
  const data = query.data ?? EMPTY_EXECUTIVE_DASHBOARD;
  return { ...query, data };
}

export function useExecutiveSummary(filters: DashboardFilters) {
  return useExecutiveSection<ExecutiveDashboardResponse['summary']>('executive-summary', filters, '/dashboard/analytics/executive');
}

export function useExecutiveKPIs(filters: DashboardFilters) {
  const dashboard = useExecutiveDashboard(filters);
  return useMemo(() => ({ ...dashboard, data: mapExecutiveKPIs(dashboard.data.kpis?.items, filters) }), [dashboard, filters]);
}

export function usePortfolioHealth(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutivePerformanceTrend(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveTopBooks(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveUnderperformingBooks(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveProviderOverview(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveMarketplaceOverview(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveGeographicOverview(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveFormatOverview(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveOpportunities(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveAIInsights(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveRisks(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveAlerts(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveActivity(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveFreshness(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
export function useExecutiveOperationalWarnings(filters: DashboardFilters) { return useExecutiveDashboard(filters); }
