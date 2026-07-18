import { EmptyState } from '@/components/common/empty-state';
import { DashboardShell } from '@/features/analytics-dashboard';
import { createEntityAnalyticsDashboardDefinition } from '../entity-dashboard-definition';
import { getAnalyticsEntityAdapter } from '../entity-registry';
import type { AnalyticsDashboardKey } from '../types';

export function EntityAnalyticsDashboardPage({ dashboardKey }: { dashboardKey: AnalyticsDashboardKey }) {
  const adapter = getAnalyticsEntityAdapter(dashboardKey);
  if (!adapter) return <EmptyState preset="error" title="Analytics dashboard not found" description="The requested entity analytics dashboard is not registered." />;
  return <DashboardShell definition={createEntityAnalyticsDashboardDefinition(adapter)} />;
}

export const AnalyticsDashboardPage = EntityAnalyticsDashboardPage;
export const AnalyticsDashboardLayout = EntityAnalyticsDashboardPage;
export const AnalyticsDashboardDefinition = createEntityAnalyticsDashboardDefinition;
