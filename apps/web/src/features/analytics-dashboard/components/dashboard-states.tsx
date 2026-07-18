import { AlertCircle, Database, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatFreshness } from '../lib/formatters';
import type { DashboardDataCompleteness, DashboardDataFreshness } from '../types';

export function DashboardLoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-4" aria-live="polite" aria-busy="true">
      {Array.from({ length: rows }).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-xl" />)}
    </div>
  );
}

export function WidgetLoadingState() {
  return <div className="flex min-h-32 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading analytics</div>;
}

export function WidgetEmptyState({ title = 'No analytics data', description = 'Data will appear here when the connected dashboard module provides it.' }: { title?: string; description?: string }) {
  return <EmptyState preset="data" title={title} description={description} size="sm" />;
}

export function WidgetErrorState({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  return <EmptyState preset="error" title="Widget unavailable" description={error instanceof Error ? error.message : 'This widget could not be loaded.'} actionLabel={onRetry ? 'Retry' : undefined} onAction={onRetry} size="sm" />;
}

export function WidgetPartialDataState({ completeness }: { completeness?: DashboardDataCompleteness }) {
  if (!completeness || completeness.status !== 'PARTIAL') return null;
  return (
    <div className="mb-3 rounded-lg border bg-muted/40 p-3 text-sm" role="status">
      <Database className="h-4 w-4" />
      <p className="font-medium">Partial data</p>
      <p className="text-muted-foreground">{completeness.message ?? 'Some provider, royalty, currency, import, or mapping data is incomplete.'}</p>
    </div>
  );
}

export function WidgetStaleDataState({ status }: { status?: DashboardDataFreshness }) {
  if (!status || !['STALE', 'VERY_STALE', 'PARTIAL', 'UNKNOWN'].includes(status)) return null;
  return <Badge variant="outline" className="gap-1"><AlertCircle className="h-3 w-3" />{formatFreshness(status)}</Badge>;
}
