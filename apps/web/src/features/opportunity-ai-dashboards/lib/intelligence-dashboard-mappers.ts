import type { AIInsightsDashboardResponse, OpportunityDashboardResponse } from '../types';

export function opportunityDashboardUnavailableResponse(): OpportunityDashboardResponse {
  return {
    kpis: [],
    priorityDistribution: [],
    trend: [],
    categories: [],
    entityDistribution: [],
    estimatedImpact: [],
    confidenceDistribution: [],
    queue: [],
    recentlyDetected: [],
    recentlyUpdated: [],
    accepted: [],
    inProgress: [],
    resolved: [],
    ignored: [],
    expiring: [],
    freshness: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Opportunity dashboard aggregates are not available from the current backend contract.' } },
  };
}

export function aiInsightsDashboardUnavailableResponse(): AIInsightsDashboardResponse {
  return {
    executiveInsights: [],
    userInsights: [],
    growthInsights: [],
    riskInsights: [],
    performanceInsights: [],
    publishingInsights: [],
    metadataInsights: [],
    opportunityRecommendations: [],
    categories: [],
    confidenceDistribution: [],
    recentInsights: [],
    staleInsights: [],
    freshness: [],
    kpis: [],
    trend: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'AI Insights dashboard aggregates are not available from the current backend contract.' } },
  };
}
