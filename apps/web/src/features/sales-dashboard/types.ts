import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export interface SalesDashboardMetadata {
  generatedAt?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface SalesOverviewResponse {
  unitsSold?: KPIValue;
  salesGrowth?: KPIValue;
  activeBooks?: KPIValue;
  activeEditions?: KPIValue;
  activeProviders?: KPIValue;
  activeMarketplaces?: KPIValue;
  activeCountries?: KPIValue;
  refundCount?: KPIValue;
  metadata?: SalesDashboardMetadata;
}

export interface SalesTrendPoint {
  date: string;
  unitsSold?: number | null;
  comparisonUnitsSold?: number | null;
  refunds?: number | null;
}

export interface SalesTrendResponse {
  granularity?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  points: SalesTrendPoint[];
  metadata?: SalesDashboardMetadata;
}

export interface SalesRankingItem {
  id: string;
  title: string;
  subtitle?: string;
  rank?: number;
  unitsSold?: number | null;
  contributionPercentage?: number | null;
  trend?: TrendValue;
  drillDownPath?: string;
  freshness?: DashboardFreshnessMetadata;
}

export interface SalesAttentionItem extends SalesRankingItem {
  reason?: string;
  severity?: string;
  opportunityScore?: number | null;
  confidence?: number | null;
}

export interface SalesBreakdownItem {
  id: string;
  label: string;
  unitsSold?: number | null;
  contributionPercentage?: number | null;
  growth?: number | null;
  trend?: TrendValue;
  drillDownPath?: string;
  freshness?: DashboardFreshnessMetadata;
}

export interface SalesVelocityResponse {
  momentum?: number | null;
  averageDailySales?: number | null;
  recentUnitsSold?: number | null;
  trend?: TrendValue;
  metadata?: SalesDashboardMetadata;
}

export interface SalesActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: string;
  path?: string;
}

export interface SalesFreshnessItem {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface SalesDashboardResponse {
  overview?: SalesOverviewResponse;
  trend?: SalesTrendResponse;
  topBooks?: SalesRankingItem[];
  underperformingBooks?: SalesAttentionItem[];
  marketplaces?: SalesBreakdownItem[];
  providers?: SalesBreakdownItem[];
  countries?: SalesBreakdownItem[];
  formats?: SalesBreakdownItem[];
  distribution?: SalesBreakdownItem[];
  velocity?: SalesVelocityResponse;
  activity?: SalesActivityItem[];
  freshness?: SalesFreshnessItem[];
  metadata?: SalesDashboardMetadata;
}
