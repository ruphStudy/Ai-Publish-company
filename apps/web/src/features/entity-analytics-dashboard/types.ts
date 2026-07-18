import type { DashboardDataCompleteness, DashboardFreshnessMetadata, DashboardFilterKey, DashboardScope, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export type AnalyticsEntityKey = 'BOOK_ANALYTICS' | 'EDITION_ANALYTICS' | 'AUTHOR_ANALYTICS' | 'SERIES_ANALYTICS' | 'PROVIDER_ANALYTICS' | 'MARKETPLACE_ANALYTICS' | 'GEOGRAPHIC_ANALYTICS' | 'FORMAT_ANALYTICS';
export type AnalyticsDashboardKey = 'book-analytics-dashboard' | 'edition-analytics-dashboard' | 'author-analytics-dashboard' | 'series-analytics-dashboard' | 'provider-analytics-dashboard' | 'marketplace-analytics-dashboard' | 'geographic-analytics-dashboard' | 'format-analytics-dashboard';

export interface AnalyticsEntityAdapter {
  entityKey: AnalyticsEntityKey;
  dashboardKey: AnalyticsDashboardKey;
  route: string;
  title: string;
  description: string;
  requiredPermissions?: string[];
  supportedScopes: DashboardScope[];
  defaultScope: DashboardScope;
  filters: DashboardFilterKey[];
  kpiKeys: string[];
  trendSeries: string[];
  breakdownDimensions: string[];
  rankingOptions: string[];
  drillDownTargets: string[];
}

export interface EntityAnalyticsMetadata {
  generatedAt?: string;
  reportingCurrency?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface EntityHeaderView {
  id?: string;
  name?: string;
  status?: string;
  subtitle?: string;
  imageUrl?: string;
  parentRelationships?: Array<{ label: string; value: string; path?: string }>;
  actions?: Array<{ label: string; path: string; permission?: string }>;
}

export interface EntityAnalyticsTrendPoint {
  date: string;
  current?: number | null;
  comparison?: number | null;
  sales?: number | null;
  revenue?: number | null;
  royalties?: number | null;
  refunds?: number | null;
}

export interface EntityAnalyticsBreakdownItem {
  id: string;
  label: string;
  value?: number | null;
  contributionPercentage?: number | null;
  growth?: number | null;
  trend?: TrendValue;
  drillDownPath?: string;
  freshness?: DashboardFreshnessMetadata;
}

export interface EntityAnalyticsOpportunity {
  id: string;
  title: string;
  score?: number | null;
  confidence?: number | null;
  priority?: string;
  path?: string;
}

export interface EntityAnalyticsInsight {
  id: string;
  title: string;
  summary: string;
  confidence?: number | null;
  priority?: string;
  generatedAt?: string;
  path?: string;
}

export interface EntityAnalyticsActivity {
  id: string;
  title: string;
  type?: string;
  status?: string;
  timestamp?: string;
  path?: string;
}

export interface EntityAnalyticsFreshness {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface EntityAnalyticsResponse {
  header?: EntityHeaderView;
  kpis?: KPIValue[];
  trend?: EntityAnalyticsTrendPoint[];
  breakdowns?: EntityAnalyticsBreakdownItem[];
  rankings?: EntityAnalyticsBreakdownItem[];
  coverage?: EntityAnalyticsBreakdownItem[];
  comparisons?: EntityAnalyticsBreakdownItem[];
  opportunities?: EntityAnalyticsOpportunity[];
  insights?: EntityAnalyticsInsight[];
  activity?: EntityAnalyticsActivity[];
  freshness?: EntityAnalyticsFreshness[];
  metadata?: EntityAnalyticsMetadata;
}
