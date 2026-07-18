import type { DashboardFilters, DashboardKey, DashboardSavedView } from '../types';
import { api } from '@/lib/api-client';

export interface AnalyticsRequest {
  dashboardKey: DashboardKey;
  widgetKey?: string;
  filters: DashboardFilters;
}

export interface AnalyticsResponse<T = unknown> {
  data?: T;
  freshness?: unknown;
  completeness?: unknown;
  partial?: boolean;
}

export async function fetchAnalytics<T = unknown>(endpoint: string, params: Record<string, unknown>, signal?: AbortSignal): Promise<T> {
  const response = await api.get<T>(endpoint, { params, signal });
  return response.data;
}

export function mapFiltersToRequest(filters: DashboardFilters): Record<string, string | number | boolean> {
  return Object.entries(filters).reduce<Record<string, string | number | boolean>>((params, [key, value]) => {
    if (value === undefined || value === null || value === '') return params;
    if (Array.isArray(value)) {
      if (value.length) params[key] = value.join(',');
      return params;
    }
    if (typeof value === 'object') return params;
    params[key] = value;
    return params;
  }, {});
}

export function loadSavedViews(dashboardKey: DashboardKey): DashboardSavedView[] {
  const raw = localStorage.getItem(`analytics:saved-views:${dashboardKey}`);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as DashboardSavedView[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistSavedViews(dashboardKey: DashboardKey, views: DashboardSavedView[]) {
  localStorage.setItem(`analytics:saved-views:${dashboardKey}`, JSON.stringify(views));
}
