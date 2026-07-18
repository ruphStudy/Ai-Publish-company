import { DashboardShell } from '@/features/analytics-dashboard';
import { executiveDashboardDefinition } from '../executive-dashboard-definition';

export function ExecutiveDashboardPage() {
  return <DashboardShell definition={executiveDashboardDefinition} />;
}

export const ExecutiveDashboardRoute = ExecutiveDashboardPage;
export const ExecutiveDashboardLayout = ExecutiveDashboardPage;
export const ExecutiveDashboardHeader = ExecutiveDashboardPage;
export const ExecutiveDashboardToolbar = ExecutiveDashboardPage;
