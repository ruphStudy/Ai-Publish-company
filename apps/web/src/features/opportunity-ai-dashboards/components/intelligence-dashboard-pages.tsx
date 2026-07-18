import { DashboardShell } from '@/features/analytics-dashboard';
import { aiInsightsDashboardDefinition, opportunityDashboardDefinition } from '../intelligence-dashboard-definitions';

export function OpportunityDashboardPage() {
  return <DashboardShell definition={opportunityDashboardDefinition} />;
}

export function AIInsightsDashboardPage() {
  return <DashboardShell definition={aiInsightsDashboardDefinition} />;
}
