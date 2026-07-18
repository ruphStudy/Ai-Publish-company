import { Download, RefreshCw, Save, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDate, formatFreshness } from '../lib/formatters';
import type { DashboardDataFreshness, DashboardExportFormat, DashboardRefreshState } from '../types';

export function DashboardRefreshControl({ state, onRefresh }: { state: DashboardRefreshState; onRefresh: () => void }) {
  return <Button variant="outline" onClick={onRefresh} disabled={state === 'REFRESHING'}><RefreshCw className={state === 'REFRESHING' ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />Refresh</Button>;
}

export function DashboardFreshnessIndicator({ status = 'UNKNOWN', lastRefreshedAt }: { status?: DashboardDataFreshness; lastRefreshedAt?: string }) {
  return <Badge variant="outline" title={lastRefreshedAt ? `Last refreshed ${formatDate(lastRefreshedAt)}` : undefined}>{formatFreshness(status)}</Badge>;
}

export function DashboardExportMenu({ formats = [], disabled }: { formats?: DashboardExportFormat[]; disabled?: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" disabled={disabled || !formats.length}><Download className="mr-2 h-4 w-4" />Export</Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">{formats.map((format) => <DropdownMenuItem key={format}>{format}</DropdownMenuItem>)}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DashboardSavedViewMenu({ disabled }: { disabled?: boolean }) {
  return <Button variant="outline" disabled={disabled}><Save className="mr-2 h-4 w-4" />Views</Button>;
}

export function DashboardPreferencesPanel() {
  return <Button variant="ghost" size="icon" aria-label="Dashboard preferences"><Settings2 className="h-4 w-4" /></Button>;
}

export function DashboardToolbar({ refreshState, onRefresh, exportFormats, savedViewsEnabled, lastRefreshedAt }: { refreshState: DashboardRefreshState; onRefresh: () => void; exportFormats?: DashboardExportFormat[]; savedViewsEnabled?: boolean; lastRefreshedAt?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DashboardFreshnessIndicator lastRefreshedAt={lastRefreshedAt} />
      <DashboardRefreshControl state={refreshState} onRefresh={onRefresh} />
      <DashboardExportMenu formats={exportFormats} />
      <DashboardSavedViewMenu disabled={!savedViewsEnabled} />
      <DashboardPreferencesPanel />
    </div>
  );
}
