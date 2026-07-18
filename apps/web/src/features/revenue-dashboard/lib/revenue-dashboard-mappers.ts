import type { RevenueDashboardResponse } from '../types';

export function revenueDashboardUnavailableResponse(): RevenueDashboardResponse {
  return {
    booksAndEditions: [],
    providers: [],
    marketplaces: [],
    geographies: [],
    formats: [],
    distribution: [],
    refundsAndAdjustments: [],
    currencyCoverage: [],
    freshness: [],
    activity: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Revenue dashboard aggregates are not available from the current backend contract.' } },
  };
}
