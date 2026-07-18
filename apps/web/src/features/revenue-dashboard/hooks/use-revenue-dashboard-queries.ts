import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import type { RevenueDashboardResponse } from '../types';

function useRevenueSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'revenue-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId ?? filters.bookIds?.[0], filters }, endpoint, enabled);
}

export function useRevenueDashboard(filters: DashboardFilters) {
  const query = useRevenueSection<RevenueDashboardResponse>('revenue-dashboard', filters, '/dashboard/analytics/revenue');
  return { ...query, data: query.data ?? { booksAndEditions: [], providers: [], marketplaces: [], geographies: [], formats: [], distribution: [], refundsAndAdjustments: [], currencyCoverage: [], freshness: [], activity: [] } };
}

export function useRevenueOverview(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueTrend(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueBookEditionRanking(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueProviderBreakdown(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueMarketplaceBreakdown(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueGeographicBreakdown(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueFormatBreakdown(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueDistribution(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRefundAdjustmentAnalysis(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useCurrencyCoverage(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRevenueFreshness(filters: DashboardFilters) { return useRevenueDashboard(filters); }
export function useRecentRevenueActivity(filters: DashboardFilters) { return useRevenueDashboard(filters); }
