import { useMemo } from 'react';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import { mapUserKPIs } from '../lib/user-dashboard-mappers';
import type { UserDashboardResponse } from '../types';

function useUserSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'user-dashboard', widgetKey, scope: filters.scope ?? 'USER', entityId: filters.projectId ?? filters.portfolioId, filters }, endpoint, enabled);
}

export function useUserDashboard(filters: DashboardFilters) {
  const query = useUserSection<UserDashboardResponse>('user-dashboard', filters, '/dashboard/analytics/user');
  return { ...query, data: query.data ?? { kpis: [], books: [], continueWorking: [], favorites: [], recentActivity: [], recentImports: [], recentSyncs: [], recentAnalytics: [], opportunities: [], aiInsights: [], alerts: [], quickActions: [], freshness: [] } };
}

export function useUserDashboardSummary(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useMyKPIs(filters: DashboardFilters) {
  const dashboard = useUserDashboard(filters);
  return useMemo(() => ({ ...dashboard, data: mapUserKPIs(dashboard.data.kpis, filters) }), [dashboard, filters]);
}
export function useMyBooks(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useContinueWorking(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useFavorites(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useUserRecentActivity(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useRecentImports(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useRecentSyncs(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useRecentAnalytics(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useMyOpportunities(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useMyAIInsights(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useMyAlerts(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useQuickActions(filters: DashboardFilters) { return useUserDashboard(filters); }
export function useDashboardFreshness(filters: DashboardFilters) { return useUserDashboard(filters); }
