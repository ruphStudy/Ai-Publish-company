import type { DashboardComparisonMode, DashboardDatePeriod, DashboardFilters, DashboardScope } from '../types';

const arrayKeys: Array<keyof DashboardFilters> = ['bookIds', 'editionIds', 'authorIds', 'seriesIds', 'providerKeys', 'marketplaceIds', 'countryCodes', 'territoryCodes', 'formats', 'transactionTypes', 'royaltyTypes', 'paymentStatuses', 'categories', 'priorities', 'statuses'];

export function parseDashboardFilters(searchParams: URLSearchParams, defaults: DashboardFilters = {}): DashboardFilters {
  const filters: DashboardFilters = { ...defaults };
  const setString = <K extends keyof DashboardFilters>(key: K) => {
    const value = searchParams.get(key);
    if (value) filters[key] = value as DashboardFilters[K];
  };
  setString('scope');
  setString('projectId');
  setString('portfolioId');
  setString('currencyCode');
  setString('timezone');
  setString('search');
  setString('sortBy');
  setString('sortDirection');
  setString('activeTab');
  const period = searchParams.get('period') as DashboardDatePeriod | null;
  if (period) filters.period = period;
  const comparisonMode = searchParams.get('comparisonMode') as DashboardComparisonMode | null;
  if (comparisonMode) filters.comparisonMode = comparisonMode;
  const scope = searchParams.get('scope') as DashboardScope | null;
  if (scope) filters.scope = scope;
  const page = Number(searchParams.get('page'));
  if (Number.isFinite(page) && page > 0) filters.page = page;
  const pageSize = Number(searchParams.get('pageSize'));
  if (Number.isFinite(pageSize) && pageSize > 0) filters.pageSize = pageSize;
  const minimumConfidence = Number(searchParams.get('minimumConfidence'));
  if (Number.isFinite(minimumConfidence)) filters.minimumConfidence = minimumConfidence;
  const minimumScore = Number(searchParams.get('minimumScore'));
  if (Number.isFinite(minimumScore)) filters.minimumScore = minimumScore;
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  if (from || to) filters.dateRange = { from: from ?? undefined, to: to ?? undefined };
  const comparisonFrom = searchParams.get('comparisonFrom');
  const comparisonTo = searchParams.get('comparisonTo');
  if (comparisonFrom || comparisonTo) filters.comparisonDateRange = { from: comparisonFrom ?? undefined, to: comparisonTo ?? undefined };
  for (const key of arrayKeys) {
    const value = searchParams.get(key);
    if (value) filters[key] = value.split(',').filter(Boolean) as never;
  }
  return filters;
}

export function serializeDashboardFilters(filters: DashboardFilters, defaults: DashboardFilters = {}): URLSearchParams {
  const params = new URLSearchParams();
  const set = (key: keyof DashboardFilters, value: unknown, defaultValue?: unknown) => {
    if (value === undefined || value === null || value === '' || JSON.stringify(value) === JSON.stringify(defaultValue)) return;
    params.set(key, String(value));
  };
  set('scope', filters.scope, defaults.scope);
  set('projectId', filters.projectId, defaults.projectId);
  set('portfolioId', filters.portfolioId, defaults.portfolioId);
  set('period', filters.period, defaults.period);
  set('comparisonMode', filters.comparisonMode, defaults.comparisonMode);
  set('currencyCode', filters.currencyCode, defaults.currencyCode);
  set('timezone', filters.timezone, defaults.timezone);
  set('minimumConfidence', filters.minimumConfidence, defaults.minimumConfidence);
  set('minimumScore', filters.minimumScore, defaults.minimumScore);
  set('search', filters.search, defaults.search);
  set('sortBy', filters.sortBy, defaults.sortBy);
  set('sortDirection', filters.sortDirection, defaults.sortDirection);
  set('page', filters.page, defaults.page);
  set('pageSize', filters.pageSize, defaults.pageSize);
  set('activeTab', filters.activeTab, defaults.activeTab);
  if (filters.dateRange?.from) params.set('from', filters.dateRange.from);
  if (filters.dateRange?.to) params.set('to', filters.dateRange.to);
  if (filters.comparisonDateRange?.from) params.set('comparisonFrom', filters.comparisonDateRange.from);
  if (filters.comparisonDateRange?.to) params.set('comparisonTo', filters.comparisonDateRange.to);
  for (const key of arrayKeys) {
    const value = filters[key];
    if (Array.isArray(value) && value.length) params.set(key, [...value].sort().join(','));
  }
  return params;
}

export function stableSerializeFilters(filters: DashboardFilters): string {
  return JSON.stringify(Object.keys(filters).sort().reduce<Record<string, unknown>>((acc, key) => {
    const value = filters[key as keyof DashboardFilters];
    acc[key] = Array.isArray(value) ? [...value].sort() : value;
    return acc;
  }, {}));
}
