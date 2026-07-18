import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/common/empty-state';
import { dashboardRegistry } from '../registry';
import { canViewDashboard } from '../lib/permissions';
import { useDashboardPermissions } from '../hooks/use-dashboard-permissions';
import { useDashboardRefresh } from '../hooks/use-dashboard-refresh';
import { useDashboardState } from '../hooks/use-dashboard-state';
import { DashboardFilterProvider } from './dashboard-filter-provider';
import { DashboardFilterBar, DashboardFilterDrawer } from './dashboard-filters';
import { DashboardHeader } from './dashboard-header';
import { DashboardContent } from './dashboard-layout';
import { DashboardNavigation } from './dashboard-navigation';
import type { DashboardDefinition, DashboardKey } from '../types';

function useSelectedDashboard(definition?: DashboardDefinition) {
  return useMemo(() => definition ?? dashboardRegistry.get('overview'), [definition]);
}

export function DashboardShell({ definition }: { definition?: DashboardDefinition }) {
  const selected = useSelectedDashboard(definition);
  const permissions = useDashboardPermissions();
  if (!selected) return <EmptyState preset="error" title="Dashboard not found" description="The requested dashboard is not registered." />;
  if (!canViewDashboard(selected, permissions)) return <EmptyState preset="error" title="Access unavailable" description="You do not have access to this dashboard." />;
  const state = useDashboardState(selected);
  const refresh = useDashboardRefresh(selected.key);
  return (
    <DashboardFilterProvider value={{ definition: selected, ...state }}>
      <div className="grid gap-6 xl:grid-cols-[16rem_minmax(0,1fr)]">
        <aside className="hidden xl:block"><Card><CardContent className="p-3"><DashboardNavigation permissions={permissions} /></CardContent></Card></aside>
        <div className="min-w-0 space-y-6">
          <DashboardHeader definition={selected} refreshState={refresh.state} onRefresh={refresh.refresh} lastRefreshedAt={refresh.lastRefreshedAt} />
          <DashboardFilterDrawer />
          <DashboardFilterBar />
          <DashboardContent definition={selected} filters={state.appliedFilters} permissions={permissions} refresh={refresh.refresh} />
        </div>
      </div>
    </DashboardFilterProvider>
  );
}

export function DashboardRouteRegistry() {
  const { dashboardKey } = useParams();
  if (!dashboardKey) return <Navigate to="/analytics/overview" replace />;
  const definition = dashboardRegistry.get(dashboardKey as DashboardKey);
  if (!definition) return <EmptyState preset="error" title="Dashboard not found" description="This dashboard route is not available." />;
  return <DashboardShell definition={definition} />;
}
