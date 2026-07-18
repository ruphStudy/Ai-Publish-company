import { DashboardShell } from '@/features/analytics-dashboard';
import { userDashboardDefinition } from '../user-dashboard-definition';

export function UserDashboardPage() {
  return <DashboardShell definition={userDashboardDefinition} />;
}

export const UserDashboardRoute = UserDashboardPage;
export const UserDashboardLayout = UserDashboardPage;
export const UserDashboardHeader = UserDashboardPage;
export const UserDashboardToolbar = UserDashboardPage;
