import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import type { UserDashboardResponse, UserKPIItem } from '../types';

export function userDashboardUnavailableResponse(): UserDashboardResponse {
  return {
    kpis: [],
    books: [],
    continueWorking: [],
    favorites: [],
    recentActivity: [],
    recentImports: [],
    recentSyncs: [],
    recentAnalytics: [],
    opportunities: [],
    aiInsights: [],
    alerts: [],
    quickActions: [],
    freshness: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'User dashboard aggregates are not available from the current backend contract.' } },
  };
}

export function mapUserKPIs(items?: UserKPIItem[], filters?: DashboardFilters): UserKPIItem[] {
  const currency = filters?.currencyCode ?? 'USD';
  return (items ?? []).map((item) => ({ ...item, currency: item.currency ?? currency }));
}
