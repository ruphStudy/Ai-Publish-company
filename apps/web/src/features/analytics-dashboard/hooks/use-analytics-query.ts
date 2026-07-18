import { useQuery } from '@tanstack/react-query';
import type { DashboardQueryContext } from '../types';
import { analyticsQueryKeys } from '../lib/query-keys';
import { fetchAnalytics, mapFiltersToRequest } from '../services/analytics-dashboard-api';

export function useAnalyticsQuery<T>(context: DashboardQueryContext, endpoint?: string, enabled = true) {
  return useQuery({
    queryKey: context.widgetKey ? analyticsQueryKeys.widget(context) : analyticsQueryKeys.dashboard(context),
    queryFn: ({ signal }) => {
      if (!endpoint) return Promise.resolve(undefined as T);
      return fetchAnalytics<T>(endpoint, mapFiltersToRequest(context.filters), signal);
    },
    enabled: enabled && Boolean(endpoint),
    staleTime: 300_000,
  });
}
