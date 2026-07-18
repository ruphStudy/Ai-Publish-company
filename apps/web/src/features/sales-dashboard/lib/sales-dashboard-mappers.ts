import type { SalesDashboardResponse } from '../types';

export function salesDashboardUnavailableResponse(): SalesDashboardResponse {
  return {
    topBooks: [],
    underperformingBooks: [],
    marketplaces: [],
    providers: [],
    countries: [],
    formats: [],
    distribution: [],
    activity: [],
    freshness: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Sales dashboard aggregates are not available from the current backend contract.' } },
  };
}
