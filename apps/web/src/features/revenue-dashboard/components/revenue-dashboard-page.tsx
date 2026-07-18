import { DashboardShell } from '@/features/analytics-dashboard';
import { revenueDashboardDefinition } from '../revenue-dashboard-definition';

export function RevenueDashboardPage() {
  return <DashboardShell definition={revenueDashboardDefinition} />;
}

export const RevenueDashboardRoute = RevenueDashboardPage;
export const RevenueDashboardLayout = RevenueDashboardPage;
export const RevenueDashboardHeader = RevenueDashboardPage;
export const RevenueDashboardToolbar = RevenueDashboardPage;
