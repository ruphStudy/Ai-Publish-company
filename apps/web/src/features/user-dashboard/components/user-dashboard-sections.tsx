import { Link } from 'react-router-dom';
import { AlertTriangle, BarChart3, BookOpen, Brain, Clock, ExternalLink, Heart, Lightbulb, Play, RefreshCw, Star, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatCurrency, formatDate, formatLabel, formatNumber, formatPercentage, formatScore } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { hasPermissions } from '@/features/analytics-dashboard/lib/permissions';
import { useDashboardPermissions } from '@/features/analytics-dashboard/hooks/use-dashboard-permissions';
import type { UserActivityItem, UserAIInsightItem, UserAlertItem, UserAnalyticsUpdateItem, UserBookItem, UserFavoriteItem, UserFreshnessItem, UserImportItem, UserOpportunityItem, UserQuickAction, UserSyncItem, UserWorkItem } from '../types';
import { useDashboardFreshness, useContinueWorking, useFavorites, useMyAIInsights, useMyAlerts, useMyBooks, useMyKPIs, useMyOpportunities, useQuickActions, useRecentAnalytics, useRecentImports, useRecentSyncs, useUserDashboardSummary, useUserRecentActivity } from '../hooks/use-user-dashboard-queries';

export function UserDashboardSummary({ filters }: { filters: DashboardFilters }) {
  const { data } = useUserDashboardSummary(filters);
  const summary = data.summary;
  if (!summary) return <DashboardPanel><WidgetEmptyState title="Workspace summary unavailable" description="No personalized summary endpoint is currently available." /></DashboardPanel>;
  return (
    <DashboardPanel>
      <WidgetPartialDataState completeness={summary.metadata?.completeness} />
      <div className="mb-4 flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">My Workspace</h2></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryMetric label="Active books" value={formatNumber(summary.activeBooks)} />
        <SummaryMetric label="Active editions" value={formatNumber(summary.activeEditions)} />
        <SummaryMetric label="Sales" value={formatNumber(summary.sales)} />
        <SummaryMetric label="Revenue" value={formatCurrency(summary.revenue, filters.currencyCode)} />
        <SummaryMetric label="Royalties" value={formatCurrency(summary.royalties, filters.currencyCode)} />
        <SummaryMetric label="Pending actions" value={formatNumber(summary.pendingActions)} />
        <SummaryMetric label="Opportunities" value={formatNumber(summary.opportunityCount)} />
        <SummaryMetric label="AI insights" value={formatNumber(summary.aiInsightCount)} />
        <SummaryMetric label="Alerts" value={formatNumber(summary.alertCount)} />
        <SummaryMetric label="Publishing" value={summary.publishingStatus ? formatLabel(summary.publishingStatus) : '—'} />
      </div>
    </DashboardPanel>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-semibold">{value}</p></div>;
}

export function MyKPIs({ filters }: { filters: DashboardFilters }) {
  const { data } = useMyKPIs(filters);
  if (!data.length) return <DashboardPanel><WidgetEmptyState title="My KPIs unavailable" description="No user KPI aggregate is currently exposed." /></DashboardPanel>;
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.map((item) => <DashboardKPI key={item.key} value={item} />)}</section>;
}

export function MyBooks({ filters }: { filters: DashboardFilters }) {
  const rows = useMyBooks(filters).data.books;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="No recent books" description="Recently active books will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<BookOpen className="h-5 w-5" />} title="My Books" /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={bookColumns} /></DashboardPanel>;
}

const bookColumns = [
  { key: 'title', header: 'Book' },
  { key: 'status', header: 'Status', render: (value: unknown) => <Badge variant="outline">{formatLabel(value as string)}</Badge> },
  { key: 'opportunityCount', header: 'Opportunities', align: 'right' as const, render: (value: unknown) => formatNumber(value as number) },
  { key: 'aiInsightCount', header: 'AI', align: 'right' as const, render: (value: unknown) => formatNumber(value as number) },
  { key: 'updatedAt', header: 'Updated', render: (value: unknown) => formatDate(value as string) },
];

function SectionTitle({ icon, title, actionPath }: { icon: React.ReactNode; title: string; actionPath?: string }) {
  return <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-lg font-semibold">{icon}<h2>{title}</h2></div>{actionPath && <Button asChild variant="ghost" size="sm"><Link to={actionPath}>Open <ExternalLink className="ml-2 h-4 w-4" /></Link></Button>}</div>;
}

function ItemList<T extends { id: string; title: string; subtitle?: string; status?: string; path?: string; resumePath?: string; openPath?: string; actionPath?: string }>(
  { title, icon, rows, empty, actionPath, renderMeta }: { title: string; icon: React.ReactNode; rows?: T[]; empty: string; actionPath?: string; renderMeta?: (item: T) => React.ReactNode },
) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return (
    <DashboardPanel>
      <SectionTitle icon={icon} title={title} actionPath={actionPath} />
      <div className="space-y-3">
        {rows.slice(0, 6).map((item) => {
          const path = item.resumePath ?? item.openPath ?? item.actionPath ?? item.path;
          return (
            <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{item.title}</p>
                {item.subtitle && <p className="truncate text-sm text-muted-foreground">{item.subtitle}</p>}
                {renderMeta?.(item)}
              </div>
              {path && <Button asChild variant="ghost" size="sm"><Link to={path}><ExternalLink className="h-4 w-4" /></Link></Button>}
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}

export function ContinueWorking({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserWorkItem> title="Continue Working" icon={<Play className="h-5 w-5 text-primary" />} rows={useContinueWorking(filters).data.continueWorking} empty="Recently edited projects, books, and workflows will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.type)} • {formatDate(item.updatedAt)}</p>} />;
}

export function Favorites({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserFavoriteItem> title="Favorites" icon={<Star className="h-5 w-5 text-amber-500" />} rows={useFavorites(filters).data.favorites} empty="Pinned books, authors, and projects will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.type)}</p>} />;
}

export function RecentActivity({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserActivityItem> title="Recent Activity" icon={<Clock className="h-5 w-5 text-primary" />} rows={useUserRecentActivity(filters).data.recentActivity} empty="User activity will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.type)} • {formatDate(item.timestamp)}</p>} />;
}

export function RecentImports({ filters }: { filters: DashboardFilters }) {
  const rows = useRecentImports(filters).data.recentImports?.map((item) => ({ ...item, title: item.source ?? 'Import' }));
  return <ItemList<UserImportItem & { title: string }> title="Recent Imports" icon={<RefreshCw className="h-5 w-5 text-primary" />} rows={rows} empty="Import history will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.status)} • {formatDate(item.importedAt)}</p>} />;
}

export function RecentSyncs({ filters }: { filters: DashboardFilters }) {
  const rows = useRecentSyncs(filters).data.recentSyncs?.map((item) => ({ ...item, title: [item.provider, item.marketplace].filter(Boolean).join(' / ') || 'Sync' }));
  return <ItemList<UserSyncItem & { title: string }> title="Recent Syncs" icon={<RefreshCw className="h-5 w-5 text-primary" />} rows={rows} empty="Provider and marketplace sync history will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.status)} • {formatDate(item.syncedAt)}</p>} />;
}

export function RecentAnalytics({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserAnalyticsUpdateItem> title="Recent Analytics" icon={<BarChart3 className="h-5 w-5 text-primary" />} rows={useRecentAnalytics(filters).data.recentAnalytics} empty="Analytics refresh history will appear here." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.scope)} • {formatDate(item.refreshedAt)}</p>} />;
}

export function MyOpportunities({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserOpportunityItem> title="My Opportunities" icon={<Lightbulb className="h-5 w-5 text-primary" />} rows={useMyOpportunities(filters).data.opportunities} empty="User-relevant opportunities will appear here." actionPath="/analytics/opportunities" renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatScore(item.score)} • {formatPercentage(item.confidence)}</p>} />;
}

export function MyAIInsights({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserAIInsightItem> title="My AI Insights" icon={<Brain className="h-5 w-5 text-primary" />} rows={useMyAIInsights(filters).data.aiInsights} empty="Personalized AI insights will appear here." actionPath="/analytics/ai-insights" renderMeta={(item) => <p className="text-xs text-muted-foreground">AI-generated • {formatPercentage(item.confidence)} • {formatDate(item.generatedAt)}</p>} />;
}

export function MyAlerts({ filters }: { filters: DashboardFilters }) {
  return <ItemList<UserAlertItem> title="My Alerts" icon={<AlertTriangle className="h-5 w-5 text-destructive" />} rows={useMyAlerts(filters).data.alerts} empty="No visible alerts are currently available." renderMeta={(item) => <p className="text-xs text-muted-foreground">{formatLabel(item.severity)} • {formatDate(item.timestamp)}{item.source ? ` • ${formatLabel(item.source)}` : ''}</p>} />;
}

export function QuickActions({ filters }: { filters: DashboardFilters }) {
  const permissions = useDashboardPermissions();
  const rows = useQuickActions(filters).data.quickActions?.filter((action) => hasPermissions(action.permission ? [action.permission] : undefined, permissions));
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Quick actions unavailable" description="Configured workspace shortcuts will appear here." /></DashboardPanel>;
  return (
    <DashboardPanel>
      <SectionTitle icon={<Zap className="h-5 w-5 text-primary" />} title="Quick Actions" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{rows.map((action: UserQuickAction) => <Button key={action.id} asChild variant="outline" className="h-auto justify-start p-4 text-left"><Link to={action.path}><div><p className="font-medium">{action.label}</p>{action.description && <p className="mt-1 text-xs text-muted-foreground">{action.description}</p>}</div></Link></Button>)}</div>
    </DashboardPanel>
  );
}

export function DashboardFreshness({ filters }: { filters: DashboardFilters }) {
  const rows = useDashboardFreshness(filters).data.freshness;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Dashboard freshness unavailable" description="Freshness for analytics, imports, syncs, and AI insights will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Heart className="h-5 w-5 text-primary" />} title="Dashboard Freshness" /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Last updated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export type { UserBookItem };
