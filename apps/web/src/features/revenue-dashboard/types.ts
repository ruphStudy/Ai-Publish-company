import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export interface RevenueDashboardMetadata {
  generatedAt?: string;
  reportingCurrency?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface RevenueOverviewResponse {
  grossRevenue?: KPIValue;
  netRevenue?: KPIValue;
  refundValue?: KPIValue;
  adjustments?: KPIValue;
  averageRevenuePerSale?: KPIValue;
  revenueGrowth?: KPIValue;
  revenueGeneratingBooks?: KPIValue;
  revenueGeneratingProviders?: KPIValue;
  revenueGeneratingMarketplaces?: KPIValue;
  metadata?: RevenueDashboardMetadata;
}

export interface RevenueTrendPoint {
  date: string;
  grossRevenue?: number | null;
  netRevenue?: number | null;
  refunds?: number | null;
  adjustments?: number | null;
  comparisonNetRevenue?: number | null;
}

export interface RevenueTrendResponse {
  granularity?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  points: RevenueTrendPoint[];
  metadata?: RevenueDashboardMetadata;
}

export interface RevenueBreakdownItem {
  id: string;
  label: string;
  grossRevenue?: number | null;
  netRevenue?: number | null;
  refunds?: number | null;
  adjustments?: number | null;
  contributionPercentage?: number | null;
  growth?: number | null;
  trend?: TrendValue;
  sourceCurrency?: string;
  drillDownPath?: string;
  freshness?: DashboardFreshnessMetadata;
}

export interface RefundAdjustmentItem {
  id: string;
  source?: string;
  entity?: string;
  amount?: number | null;
  rate?: number | null;
  trend?: TrendValue;
  timestamp?: string;
  drillDownPath?: string;
}

export interface CurrencyCoverageItem {
  id: string;
  sourceCurrency: string;
  reportingCurrency: string;
  conversionCoverage?: number | null;
  missingRates?: number | null;
  convertedAt?: string;
  completeness?: DashboardDataCompleteness;
}

export interface RevenueActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: string;
  path?: string;
}

export interface RevenueFreshnessItem {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface RevenueDashboardResponse {
  overview?: RevenueOverviewResponse;
  trend?: RevenueTrendResponse;
  booksAndEditions?: RevenueBreakdownItem[];
  providers?: RevenueBreakdownItem[];
  marketplaces?: RevenueBreakdownItem[];
  geographies?: RevenueBreakdownItem[];
  formats?: RevenueBreakdownItem[];
  distribution?: RevenueBreakdownItem[];
  refundsAndAdjustments?: RefundAdjustmentItem[];
  currencyCoverage?: CurrencyCoverageItem[];
  freshness?: RevenueFreshnessItem[];
  activity?: RevenueActivityItem[];
  metadata?: RevenueDashboardMetadata;
}
