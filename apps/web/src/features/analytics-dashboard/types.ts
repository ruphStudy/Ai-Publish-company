import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export type DashboardKey =
  | 'overview'
  | 'executive-overview'
  | 'user-dashboard'
  | 'sales-dashboard'
  | 'revenue-dashboard'
  | 'book-analytics-dashboard'
  | 'edition-analytics-dashboard'
  | 'author-analytics-dashboard'
  | 'series-analytics-dashboard'
  | 'provider-analytics-dashboard'
  | 'marketplace-analytics-dashboard'
  | 'geographic-analytics-dashboard'
  | 'format-analytics-dashboard'
  | 'opportunity-dashboard'
  | 'ai-insights-dashboard'
  | 'operations-dashboard'
  | 'administration-dashboard'
  | 'executive'
  | 'user'
  | 'sales'
  | 'revenue'
  | 'royalty'
  | 'book-analytics'
  | 'opportunity'
  | 'ai-insights'
  | 'operations';

export type DashboardCategory =
  | 'OVERVIEW'
  | 'FINANCIAL'
  | 'PERFORMANCE'
  | 'CONTENT'
  | 'DISTRIBUTION'
  | 'OPPORTUNITIES'
  | 'AI_INSIGHTS'
  | 'OPERATIONS'
  | 'ADMINISTRATION';

export type DashboardScope =
  | 'USER'
  | 'PROJECT'
  | 'PORTFOLIO'
  | 'BOOK'
  | 'EDITION'
  | 'AUTHOR'
  | 'SERIES'
  | 'PROVIDER'
  | 'MARKETPLACE'
  | 'COUNTRY'
  | 'TERRITORY'
  | 'FORMAT';

export type DashboardWidgetType =
  | 'KPI'
  | 'TREND_CHART'
  | 'BAR_CHART'
  | 'LINE_CHART'
  | 'AREA_CHART'
  | 'PIE_CHART'
  | 'DONUT_CHART'
  | 'STACKED_BAR_CHART'
  | 'TABLE'
  | 'RANKING'
  | 'BREAKDOWN'
  | 'COMPARISON'
  | 'PROGRESS'
  | 'HEALTH'
  | 'ALERT'
  | 'INSIGHT'
  | 'OPPORTUNITY'
  | 'ACTIVITY'
  | 'CUSTOM';

export type DashboardFilterKey = keyof DashboardFilters;

export type DashboardDatePeriod =
  | 'TODAY'
  | 'YESTERDAY'
  | 'LAST_7_DAYS'
  | 'LAST_30_DAYS'
  | 'LAST_90_DAYS'
  | 'CURRENT_WEEK'
  | 'PREVIOUS_WEEK'
  | 'CURRENT_MONTH'
  | 'PREVIOUS_MONTH'
  | 'CURRENT_QUARTER'
  | 'PREVIOUS_QUARTER'
  | 'CURRENT_YEAR'
  | 'PREVIOUS_YEAR'
  | 'LIFETIME'
  | 'CUSTOM';

export type DashboardComparisonMode =
  | 'NONE'
  | 'PREVIOUS_PERIOD'
  | 'PREVIOUS_CALENDAR_PERIOD'
  | 'PREVIOUS_YEAR'
  | 'LIFETIME_AVERAGE'
  | 'CUSTOM';

export type DashboardDataFreshness = 'FRESH' | 'AGING' | 'STALE' | 'VERY_STALE' | 'UNKNOWN' | 'PARTIAL';
export type DashboardExportFormat = 'CSV' | 'XLSX' | 'PNG' | 'PDF';
export type DashboardRefreshState = 'IDLE' | 'REFRESHING' | 'FAILED' | 'SUCCESS';
export type DashboardDensity = 'COMFORTABLE' | 'DENSE';
export type DashboardPermission = string;

export interface DashboardDateRange {
  from?: string;
  to?: string;
}

export interface DashboardFilters {
  scope?: DashboardScope;
  projectId?: string;
  portfolioId?: string;
  bookIds?: string[];
  editionIds?: string[];
  authorIds?: string[];
  seriesIds?: string[];
  providerKeys?: string[];
  marketplaceIds?: string[];
  countryCodes?: string[];
  territoryCodes?: string[];
  formats?: string[];
  currencyCode?: string;
  transactionTypes?: string[];
  royaltyTypes?: string[];
  paymentStatuses?: string[];
  period?: DashboardDatePeriod;
  dateRange?: DashboardDateRange;
  comparisonMode?: DashboardComparisonMode;
  comparisonDateRange?: DashboardDateRange;
  timezone?: string;
  dataFreshness?: DashboardDataFreshness;
  minimumConfidence?: number;
  minimumScore?: number;
  categories?: string[];
  priorities?: string[];
  statuses?: string[];
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  activeTab?: string;
}

export interface DashboardDataCompleteness {
  status: DashboardDataFreshness;
  missingProviderData?: string[];
  missingRoyaltyData?: boolean;
  missingCurrencyConversion?: boolean;
  incompleteBookMapping?: boolean;
  incompleteEditionMapping?: boolean;
  staleImports?: boolean;
  failedNormalization?: boolean;
  failedAnalyticsRefresh?: boolean;
  incompleteProviderCoverage?: boolean;
  message?: string;
}

export interface DashboardFreshnessMetadata {
  status: DashboardDataFreshness;
  lastSalesImport?: string;
  lastRoyaltyImport?: string;
  lastNormalization?: string;
  lastAnalyticsRefresh?: string;
  lastOpportunityRefresh?: string;
  lastAIInsightRefresh?: string;
}

export interface DashboardLayoutItem {
  widgetKey: string;
  colSpan?: 1 | 2 | 3 | 4 | 6 | 8 | 12;
  minHeight?: number;
  section?: string;
  order?: number;
  hidden?: boolean;
}

export interface DashboardLayoutDefinition {
  density?: DashboardDensity;
  columns?: 1 | 2 | 3 | 4 | 6 | 12;
  minWidgetHeight?: number;
  items: DashboardLayoutItem[];
}

export interface DashboardWidgetDefinition {
  key: string;
  type: DashboardWidgetType;
  title: string;
  description?: string;
  category?: DashboardCategory;
  supportedDashboards?: DashboardKey[];
  supportedScopes?: DashboardScope[];
  requiredPermissions?: DashboardPermission[];
  requiredMetrics?: string[];
  supportedFilters?: DashboardFilterKey[];
  queryDefinition?: DashboardQueryDefinition;
  visualizationDefinition?: Record<string, unknown>;
  defaultSize?: DashboardWidgetSize;
  minimumSize?: DashboardWidgetSize;
  maximumSize?: DashboardWidgetSize;
  refreshBehavior?: 'MANUAL' | 'BACKGROUND' | 'INHERIT';
  exportCapabilities?: DashboardExportFormat[];
  emptyStateDefinition?: EmptyStateDefinition;
  featureFlag?: string;
  version: number;
  metadata?: Record<string, unknown>;
  render?: (context: WidgetRenderContext) => ReactNode;
}

export interface DashboardWidgetSize {
  columns: number;
  rows: number;
}

export interface EmptyStateDefinition {
  title: string;
  description?: string;
  actionLabel?: string;
}

export interface DashboardQueryDefinition {
  endpoint?: string;
  queryKeyBase: string;
  method?: 'GET' | 'POST';
  staleTimeMs?: number;
  enabled?: boolean;
}

export interface DashboardDefinition {
  key: DashboardKey;
  route: string;
  title: string;
  description?: string;
  icon?: LucideIcon;
  category: DashboardCategory;
  order: number;
  enabled: boolean;
  requiredPermissions?: DashboardPermission[];
  supportedScopes: DashboardScope[];
  defaultScope: DashboardScope;
  supportedFilters: DashboardFilterKey[];
  defaultFilters: DashboardFilters;
  supportedPeriods: DashboardDatePeriod[];
  defaultPeriod: DashboardDatePeriod;
  supportedComparisonModes: DashboardComparisonMode[];
  defaultComparisonMode: DashboardComparisonMode;
  supportedCurrencies?: string[];
  widgetDefinitions: DashboardWidgetDefinition[];
  layoutDefinition: DashboardLayoutDefinition;
  exportCapabilities?: DashboardExportFormat[];
  refreshCapabilities?: Array<'DASHBOARD' | 'WIDGET' | 'VISIBLE_WIDGETS' | 'BACKGROUND'>;
  savedViewSupport?: boolean;
  featureFlag?: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardQueryContext {
  dashboardKey: DashboardKey;
  widgetKey?: string;
  scope: DashboardScope;
  entityId?: string;
  filters: DashboardFilters;
  apiVersion?: string;
}

export interface DashboardPreference {
  defaultDashboard?: DashboardKey;
  defaultScope?: DashboardScope;
  defaultPeriod?: DashboardDatePeriod;
  defaultCurrency?: string;
  visibleWidgets?: string[];
  hiddenWidgets?: string[];
  widgetOrder?: string[];
  density?: DashboardDensity;
  tablePageSize?: number;
  showChartLegend?: boolean;
  comparisonPreference?: DashboardComparisonMode;
  autoRefreshSeconds?: number;
  sidebarCollapsed?: boolean;
}

export interface DashboardSavedView {
  id: string;
  name: string;
  dashboardKey: DashboardKey;
  scope: DashboardScope;
  filters: DashboardFilters;
  period: DashboardDatePeriod;
  comparison: DashboardComparisonMode;
  currency?: string;
  visibleWidgets?: string[];
  widgetOrder?: string[];
  sorting?: Pick<DashboardFilters, 'sortBy' | 'sortDirection'>;
  createdBy?: string;
  isDefault?: boolean;
  isShared?: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface KPIValue {
  label: string;
  value?: number | string | null;
  secondaryValue?: number | string | null;
  currency?: string;
  percentage?: number;
  unit?: string;
  trend?: TrendValue;
  comparisonLabel?: string;
}

export interface TrendValue {
  direction: 'UP' | 'DOWN' | 'FLAT';
  absoluteChange?: number;
  percentageChange?: number;
  label?: string;
}

export interface ComparisonValue {
  current?: number | null;
  previous?: number | null;
  difference?: number | null;
  percentageDifference?: number | null;
}

export interface ChartDataPoint {
  label: string;
  value?: number | null;
  date?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  [key: string]: string | number | boolean | null | undefined | Record<string, unknown>;
}

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  unit?: string;
  visible?: boolean;
}

export interface AnalyticsTableColumn<T = Record<string, unknown>> {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface AnalyticsTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  filters?: DashboardFilters;
}

export interface WidgetRenderContext {
  dashboard: DashboardDefinition;
  widget: DashboardWidgetDefinition;
  filters: DashboardFilters;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
  refresh: () => void;
}
