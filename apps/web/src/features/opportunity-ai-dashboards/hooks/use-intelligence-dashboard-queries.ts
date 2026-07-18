import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import type { AIInsightsDashboardResponse, OpportunityDashboardResponse } from '../types';

function useOpportunitySection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'opportunity-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId ?? filters.bookIds?.[0], filters }, endpoint, enabled);
}

function useAIInsightsSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'ai-insights-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId ?? filters.bookIds?.[0], filters }, endpoint, enabled);
}

export function useOpportunityDashboard(filters: DashboardFilters) {
  const query = useOpportunitySection<OpportunityDashboardResponse>('opportunity-dashboard', filters, '/dashboard/analytics/opportunities');
  return { ...query, data: query.data ?? { kpis: [], priorityDistribution: [], trend: [], categories: [], entityDistribution: [], estimatedImpact: [], confidenceDistribution: [], queue: [], recentlyDetected: [], recentlyUpdated: [], accepted: [], inProgress: [], resolved: [], ignored: [], expiring: [], freshness: [] } };
}

export function useAIInsightsDashboard(filters: DashboardFilters) {
  const query = useAIInsightsSection<AIInsightsDashboardResponse>('ai-insights-dashboard', filters, '/dashboard/analytics/ai-insights');
  return { ...query, data: query.data ?? { executiveInsights: [], userInsights: [], growthInsights: [], riskInsights: [], performanceInsights: [], publishingInsights: [], metadataInsights: [], opportunityRecommendations: [], categories: [], confidenceDistribution: [], recentInsights: [], staleInsights: [], freshness: [], kpis: [], trend: [] } };
}

export function useOpportunitySummary(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useOpportunityKPIs(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useOpportunityTrend(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useOpportunityDistributions(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useOpportunityLists(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useOpportunityFreshness(filters: DashboardFilters) { return useOpportunityDashboard(filters); }
export function useAIInsightKPIs(filters: DashboardFilters) { return useAIInsightsDashboard(filters); }
export function useAIInsightTrend(filters: DashboardFilters) { return useAIInsightsDashboard(filters); }
export function useAIInsightDistributions(filters: DashboardFilters) { return useAIInsightsDashboard(filters); }
export function useAIInsightLists(filters: DashboardFilters) { return useAIInsightsDashboard(filters); }
export function useAIInsightFreshness(filters: DashboardFilters) { return useAIInsightsDashboard(filters); }
