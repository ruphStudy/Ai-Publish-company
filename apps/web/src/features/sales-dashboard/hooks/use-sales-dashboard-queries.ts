import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import type { SalesDashboardResponse } from '../types';

function useSalesSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'sales-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId ?? filters.bookIds?.[0], filters }, endpoint, enabled);
}

export function useSalesDashboard(filters: DashboardFilters) {
  const query = useSalesSection<SalesDashboardResponse>('sales-dashboard', filters, '/dashboard/analytics/sales');
  return { ...query, data: query.data ?? { topBooks: [], underperformingBooks: [], marketplaces: [], providers: [], countries: [], formats: [], distribution: [], activity: [], freshness: [] } };
}

export function useSalesOverview(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useSalesTrend(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useTopSellingBooks(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useUnderperformingSalesBooks(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useMarketplaceSalesPerformance(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useProviderSalesPerformance(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useCountrySalesPerformance(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useFormatSalesPerformance(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useSalesDistribution(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useSalesVelocity(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useRecentSalesActivity(filters: DashboardFilters) { return useSalesDashboard(filters); }
export function useSalesDataFreshness(filters: DashboardFilters) { return useSalesDashboard(filters); }
