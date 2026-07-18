import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export type ExecutiveHealthStatus = 'EXCELLENT' | 'GOOD' | 'STABLE' | 'NEEDS_ATTENTION' | 'AT_RISK' | 'CRITICAL' | 'UNKNOWN';
export type ExecutiveSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ExecutivePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExecutiveDashboardMetadata {
  generatedAt?: string;
  reportingCurrency?: string;
  dataCompleteness?: DashboardDataCompleteness;
  freshness?: DashboardFreshnessMetadata;
}

export interface ExecutiveSummaryResponse {
  summary?: string;
  strongestPerformanceArea?: string;
  weakestPerformanceArea?: string;
  mainGrowthDriver?: string;
  mainRisk?: string;
  highestPriorityOpportunity?: string;
  recommendedFocus?: string;
  confidence?: number;
  evidence?: string[];
  generatedAt?: string;
  provider?: string;
  model?: string;
  version?: number;
  stale?: boolean;
  partial?: boolean;
}

export interface ExecutiveKPIItem extends KPIValue {
  key: string;
  tooltip?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
  estimated?: boolean;
  finalized?: boolean;
  drillDownPath?: string;
}

export interface ExecutiveKPIResponse {
  items: ExecutiveKPIItem[];
  metadata?: ExecutiveDashboardMetadata;
}

export interface PortfolioHealthDimension {
  key: string;
  label: string;
  status: ExecutiveHealthStatus;
  score?: number | null;
  description?: string;
  freshness?: DashboardFreshnessMetadata;
}

export interface PortfolioHealthResponse {
  overallScore?: number | null;
  overallStatus: ExecutiveHealthStatus;
  dimensions: PortfolioHealthDimension[];
  metadata?: ExecutiveDashboardMetadata;
}

export interface ExecutiveTrendSeries {
  key: string;
  label: string;
  unit?: string;
  currency?: string;
  points: Array<{ date: string; value?: number | null; comparisonValue?: number | null }>;
}

export interface ExecutiveTrendResponse {
  granularity?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  series: ExecutiveTrendSeries[];
  metadata?: ExecutiveDashboardMetadata;
}

export interface ExecutiveRankingItem {
  id: string;
  title: string;
  author?: string;
  series?: string;
  coverUrl?: string;
  primaryMetric?: number | string | null;
  secondaryMetric?: number | string | null;
  trend?: TrendValue;
  activeFormats?: string[];
  activeProviders?: string[];
  topMarketplace?: string;
  freshness?: DashboardFreshnessMetadata;
  drillDownPath?: string;
}

export interface ExecutiveAttentionItem extends ExecutiveRankingItem {
  primaryIssue?: string;
  severity?: ExecutiveSeverity;
  opportunityScore?: number;
  confidence?: number;
  recommendedAction?: string;
}

export interface ExecutiveBreakdownItem {
  id: string;
  label: string;
  contribution?: number | null;
  contributionPercentage?: number | null;
  salesUnits?: number | null;
  revenue?: number | null;
  royalties?: number | null;
  growth?: number | null;
  refundRate?: number | null;
  activeBooks?: number | null;
  activeEditions?: number | null;
  activeProviders?: number | null;
  activeMarketplaces?: number | null;
  opportunities?: number | null;
  risks?: number | null;
  freshness?: DashboardFreshnessMetadata;
  drillDownPath?: string;
}

export interface ExecutiveOpportunityItem {
  id: string;
  title: string;
  category?: string;
  type?: string;
  scope?: string;
  affectedEntity?: string;
  score?: number;
  confidence?: number;
  priority?: ExecutivePriority;
  estimatedImpact?: string;
  reason?: string;
  suggestedActionType?: string;
  expiresAt?: string;
  status?: string;
  evidenceSummary?: string;
  drillDownPath?: string;
}

export interface ExecutiveInsightItem {
  id: string;
  title: string;
  summary: string;
  category?: string;
  type?: string;
  priority?: ExecutivePriority;
  confidence?: number;
  generatedAt?: string;
  supportingMetrics?: string[];
  relatedOpportunities?: string[];
  affectedEntities?: string[];
  suggestedActions?: string[];
  drillDownPath?: string;
}

export interface ExecutiveRiskItem {
  id: string;
  title: string;
  category?: string;
  severity: ExecutiveSeverity;
  confidence?: number;
  affectedEntity?: string;
  supportingMetric?: string;
  businessImpact?: string;
  recommendedAction?: string;
  freshness?: DashboardFreshnessMetadata;
  drillDownPath?: string;
}

export interface ExecutiveAlertItem {
  id: string;
  title: string;
  severity: ExecutiveSeverity;
  timestamp?: string;
  source?: string;
  entity?: string;
  unread?: boolean;
  drillDownPath?: string;
}

export interface ExecutiveActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  actor?: string;
  timestamp?: string;
  entity?: string;
  status?: string;
  drillDownPath?: string;
}

export interface ExecutiveFreshnessItem {
  key: string;
  label: string;
  timestamp?: string;
  status: DashboardFreshnessMetadata['status'];
  providerCoverage?: string;
  missingSources?: string[];
  failureStatus?: string;
}

export interface ExecutiveOperationalWarning {
  id: string;
  title: string;
  severity: ExecutiveSeverity;
  description?: string;
  source?: string;
  drillDownPath?: string;
}

export interface ExecutiveDashboardResponse {
  summary?: ExecutiveSummaryResponse;
  kpis?: ExecutiveKPIResponse;
  portfolioHealth?: PortfolioHealthResponse;
  trend?: ExecutiveTrendResponse;
  topBooks?: ExecutiveRankingItem[];
  underperformingBooks?: ExecutiveAttentionItem[];
  providers?: ExecutiveBreakdownItem[];
  marketplaces?: ExecutiveBreakdownItem[];
  geographies?: ExecutiveBreakdownItem[];
  formats?: ExecutiveBreakdownItem[];
  opportunities?: ExecutiveOpportunityItem[];
  insights?: ExecutiveInsightItem[];
  risks?: ExecutiveRiskItem[];
  alerts?: ExecutiveAlertItem[];
  activity?: ExecutiveActivityItem[];
  freshness?: ExecutiveFreshnessItem[];
  warnings?: ExecutiveOperationalWarning[];
  metadata?: ExecutiveDashboardMetadata;
}
