import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { DashboardDefinition } from '../types';
import { DashboardToolbar } from './dashboard-toolbar';

export function DashboardHeader({ definition, refreshState, onRefresh, lastRefreshedAt }: { definition: DashboardDefinition; refreshState: 'IDLE' | 'REFRESHING' | 'FAILED' | 'SUCCESS'; onRefresh: () => void; lastRefreshedAt?: string }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/dashboard" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to="/analytics/overview" className="hover:text-foreground">Analytics</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{definition.title}</span>
        </nav>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{definition.title}</h1>
          {definition.description && <p className="mt-1 text-muted-foreground">{definition.description}</p>}
        </div>
      </div>
      <DashboardToolbar refreshState={refreshState} onRefresh={onRefresh} exportFormats={definition.exportCapabilities} savedViewsEnabled={definition.savedViewSupport} lastRefreshedAt={lastRefreshedAt} />
    </header>
  );
}
