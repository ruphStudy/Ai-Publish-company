import type { DashboardQueryContext } from '../types';
import { stableSerializeFilters } from './url-state';

export const analyticsQueryKeys = {
  all: ['analytics-dashboard'] as const,
  dashboard: (context: DashboardQueryContext) => [
    ...analyticsQueryKeys.all,
    context.dashboardKey,
    context.scope,
    context.entityId ?? null,
    stableSerializeFilters(context.filters),
    context.apiVersion ?? 'v1',
  ] as const,
  widget: (context: DashboardQueryContext) => [
    ...analyticsQueryKeys.dashboard(context),
    context.widgetKey ?? 'dashboard',
  ] as const,
};
