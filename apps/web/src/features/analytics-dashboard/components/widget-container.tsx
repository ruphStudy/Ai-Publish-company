import { MoreHorizontal, RefreshCw, Download, Maximize2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { WidgetStaleDataState } from './dashboard-states';
import type { DashboardFreshnessMetadata } from '../types';

export function WidgetContainer({ title, description, freshness, onRefresh, onExport, children }: { title: string; description?: string; freshness?: DashboardFreshnessMetadata; onRefresh?: () => void; onExport?: () => void; children: React.ReactNode }) {
  return (
    <Card className="h-full min-h-40">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        <div className="flex items-center gap-2">
          <WidgetStaleDataState status={freshness?.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`${title} actions`}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onRefresh && <DropdownMenuItem onClick={onRefresh}><RefreshCw className="mr-2 h-4 w-4" />Refresh</DropdownMenuItem>}
              {onExport && <DropdownMenuItem onClick={onExport}><Download className="mr-2 h-4 w-4" />Export</DropdownMenuItem>}
              <DropdownMenuItem disabled><Maximize2 className="mr-2 h-4 w-4" />Expand</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
