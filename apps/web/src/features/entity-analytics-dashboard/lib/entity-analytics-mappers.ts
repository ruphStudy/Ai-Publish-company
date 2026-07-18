import type { EntityAnalyticsResponse } from '../types';

export function entityAnalyticsUnavailableResponse(): EntityAnalyticsResponse {
  return {
    kpis: [],
    trend: [],
    breakdowns: [],
    rankings: [],
    coverage: [],
    comparisons: [],
    opportunities: [],
    insights: [],
    activity: [],
    freshness: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Entity analytics aggregates are not available from the current backend contract.' } },
  };
}
