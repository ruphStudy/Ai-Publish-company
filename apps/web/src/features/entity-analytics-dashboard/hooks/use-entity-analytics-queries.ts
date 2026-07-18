import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import type { AnalyticsDashboardKey, EntityAnalyticsResponse } from '../types';

function useEntitySection<T>(dashboardKey: AnalyticsDashboardKey, widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey, widgetKey, scope: filters.scope ?? 'BOOK', entityId: filters.bookIds?.[0] ?? filters.editionIds?.[0] ?? filters.authorIds?.[0] ?? filters.seriesIds?.[0] ?? filters.providerKeys?.[0] ?? filters.marketplaceIds?.[0] ?? filters.countryCodes?.[0] ?? filters.formats?.[0], filters }, endpoint, enabled);
}

export function useEntityAnalytics(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) {
  const query = useEntitySection<EntityAnalyticsResponse>(dashboardKey, 'entity-analytics', filters, `/dashboard/analytics/entity/${dashboardKey}`);
  return { ...query, data: query.data ?? { kpis: [], rankings: [], breakdowns: [], insights: [], opportunities: [], activity: [], freshness: [] } };
}

export function useEntitySummary(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityKPIs(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityTrends(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityBreakdowns(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityRankings(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityCoverage(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityComparisons(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityOpportunities(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityInsights(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityActivity(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
export function useEntityFreshness(dashboardKey: AnalyticsDashboardKey, filters: DashboardFilters) { return useEntityAnalytics(dashboardKey, filters); }
