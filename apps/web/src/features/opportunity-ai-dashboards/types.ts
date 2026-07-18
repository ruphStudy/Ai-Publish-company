import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export interface IntelligenceDashboardMetadata {
  generatedAt?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface IntelligenceTrendPoint {
  date: string;
  current?: number | null;
  comparison?: number | null;
}

export interface IntelligenceDistributionItem {
  id: string;
  label: string;
  value?: number | null;
  percentage?: number | null;
  trend?: TrendValue;
  path?: string;
}

export interface OpportunityQueueItem {
  id: string;
  title: string;
  category?: string;
  entity?: string;
  score?: number | null;
  confidence?: number | null;
  priority?: string;
  status?: string;
  expiresAt?: string;
  updatedAt?: string;
  path?: string;
}

export interface AIInsightQueueItem {
  id: string;
  title: string;
  summary: string;
  category?: string;
  type?: string;
  confidence?: number | null;
  priority?: string;
  status?: string;
  generatedAt?: string;
  relatedEntityPath?: string;
  relatedOpportunityPath?: string;
}

export interface IntelligenceFreshnessItem {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface OpportunityDashboardResponse {
  summary?: string;
  kpis?: KPIValue[];
  priorityDistribution?: IntelligenceDistributionItem[];
  trend?: IntelligenceTrendPoint[];
  categories?: IntelligenceDistributionItem[];
  entityDistribution?: IntelligenceDistributionItem[];
  estimatedImpact?: IntelligenceDistributionItem[];
  confidenceDistribution?: IntelligenceDistributionItem[];
  queue?: OpportunityQueueItem[];
  recentlyDetected?: OpportunityQueueItem[];
  recentlyUpdated?: OpportunityQueueItem[];
  accepted?: OpportunityQueueItem[];
  inProgress?: OpportunityQueueItem[];
  resolved?: OpportunityQueueItem[];
  ignored?: OpportunityQueueItem[];
  expiring?: OpportunityQueueItem[];
  freshness?: IntelligenceFreshnessItem[];
  metadata?: IntelligenceDashboardMetadata;
}

export interface AIInsightsDashboardResponse {
  executiveInsights?: AIInsightQueueItem[];
  userInsights?: AIInsightQueueItem[];
  growthInsights?: AIInsightQueueItem[];
  riskInsights?: AIInsightQueueItem[];
  performanceInsights?: AIInsightQueueItem[];
  publishingInsights?: AIInsightQueueItem[];
  metadataInsights?: AIInsightQueueItem[];
  opportunityRecommendations?: AIInsightQueueItem[];
  categories?: IntelligenceDistributionItem[];
  confidenceDistribution?: IntelligenceDistributionItem[];
  recentInsights?: AIInsightQueueItem[];
  staleInsights?: AIInsightQueueItem[];
  freshness?: IntelligenceFreshnessItem[];
  kpis?: KPIValue[];
  trend?: IntelligenceTrendPoint[];
  metadata?: IntelligenceDashboardMetadata;
}
