import { DashboardShell } from '@/features/analytics-dashboard';
import { administrationDashboardDefinition, operationsDashboardDefinition } from '../operations-admin-definitions';

export function OperationsDashboardPage() {
  return <DashboardShell definition={operationsDashboardDefinition} />;
}

export function AdministrationDashboardPage() {
  return <DashboardShell definition={administrationDashboardDefinition} />;
}
