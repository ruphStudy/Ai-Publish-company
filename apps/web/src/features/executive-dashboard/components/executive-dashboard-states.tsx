import { AlertTriangle } from 'lucide-react';
import { EmptyState } from '@/components/common/empty-state';
import { DashboardLoadingState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import type { DashboardDataCompleteness } from '@/features/analytics-dashboard/types';

export function ExecutiveDashboardSkeleton() {
  return <DashboardLoadingState rows={6} />;
}

export function ExecutiveDashboardErrorState({ error }: { error?: unknown }) {
  return <EmptyState preset="error" title="Executive dashboard unavailable" description={error instanceof Error ? error.message : 'Executive analytics could not be loaded.'} />;
}

export function ExecutiveDashboardEmptyState() {
  return <EmptyState preset="data" title="Executive analytics awaiting data" description="Import sales, royalty, publishing, opportunity, and insight data to populate this dashboard." />;
}

export function ExecutiveDashboardPartialDataState({ completeness }: { completeness?: DashboardDataCompleteness }) {
  return <WidgetPartialDataState completeness={completeness} />;
}

export function ExecutiveWarningBanner({ message }: { message?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200" role="status">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{message ?? 'Some executive sections are unavailable because the backend does not currently expose a complete executive aggregate.'}</p>
    </div>
  );
}
