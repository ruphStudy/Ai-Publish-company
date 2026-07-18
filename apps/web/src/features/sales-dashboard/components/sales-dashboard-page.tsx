import { DashboardShell } from '@/features/analytics-dashboard';
import { salesDashboardDefinition } from '../sales-dashboard-definition';

export function SalesDashboardPage() {
  return <DashboardShell definition={salesDashboardDefinition} />;
}

export const SalesDashboardRoute = SalesDashboardPage;
export const SalesDashboardLayout = SalesDashboardPage;
export const SalesDashboardHeader = SalesDashboardPage;
export const SalesDashboardToolbar = SalesDashboardPage;
