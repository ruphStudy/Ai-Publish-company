import { Activity, BarChart3, Brain, GitCompare, HeartPulse, Lightbulb, LineChart, ListOrdered, RefreshCw, ShieldCheck } from 'lucide-react';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsChart } from '@/features/analytics-dashboard/components/dashboard-charts';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatDate, formatLabel, formatNumber, formatPercentage, formatScore } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import type { AnalyticsDashboardKey, AnalyticsEntityAdapter, EntityAnalyticsActivity, EntityAnalyticsBreakdownItem, EntityAnalyticsFreshness, EntityAnalyticsInsight, EntityAnalyticsOpportunity } from '../types';
import { useEntityActivity, useEntityAnalytics, useEntityBreakdowns, useEntityComparisons, useEntityCoverage, useEntityFreshness, useEntityInsights, useEntityKPIs, useEntityOpportunities, useEntityRankings, useEntityTrends } from '../hooks/use-entity-analytics-queries';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="mb-4 flex items-center gap-2 text-lg font-semibold">{icon}<h2>{title}</h2></div>;
}

export function AnalyticsOverview({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const { data } = useEntityKPIs(adapter.dashboardKey, filters);
  if (!data.kpis?.length) return <DashboardPanel><WidgetEmptyState title={`${adapter.title} KPIs unavailable`} description="Backend entity KPI aggregates will appear here." /></DashboardPanel>;
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WidgetPartialDataState completeness={data.metadata?.completeness} />{data.kpis.map((item) => <DashboardKPI key={item.label} value={{ ...item, currency: item.currency ?? filters.currencyCode }} />)}</section>;
}

export function AnalyticsEntityHeader({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const header = useEntityAnalytics(adapter.dashboardKey, filters).data.header;
  return (
    <DashboardPanel>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary"><BarChart3 className="h-6 w-6" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{adapter.entityKey.replace('_ANALYTICS', '').replace('_', ' ')}</p>
          <h2 className="text-2xl font-bold tracking-tight">{header?.name ?? adapter.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{header?.subtitle ?? adapter.description}</p>
          {header?.status && <p className="mt-2 text-xs text-muted-foreground">Status: {formatLabel(header.status)}</p>}
        </div>
      </div>
    </DashboardPanel>
  );
}

export function AnalyticsTrend({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const rows = useEntityTrends(adapter.dashboardKey, filters).data.trend ?? [];
  const points = rows.map((point) => ({ label: point.date, current: point.current ?? point.sales ?? null, comparison: point.comparison ?? null, revenue: point.revenue ?? null, royalties: point.royalties ?? null, refunds: point.refunds ?? null }));
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Performance trend unavailable" description="Backend entity trend data will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<LineChart className="h-5 w-5 text-primary" />} title="Performance Trend" /><AnalyticsChart type="line" data={points} series={[{ key: 'current', label: 'Current' }, { key: 'comparison', label: 'Comparison' }, { key: 'revenue', label: 'Revenue' }, { key: 'royalties', label: 'Royalties' }, { key: 'refunds', label: 'Refunds' }]} title={`${adapter.title} trend`} /></DashboardPanel>;
}

function EntityTable({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows?: EntityAnalyticsBreakdownItem[]; empty: string }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={icon} title={title} /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Name' }, { key: 'value', header: 'Value', align: 'right', render: (value) => formatNumber(value as number) }, { key: 'contributionPercentage', header: 'Contribution', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'growth', header: 'Growth', align: 'right', render: (value) => formatPercentage(value as number) }]} /></DashboardPanel>;
}

export function AnalyticsBreakdown({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) { return <EntityTable title="Contribution and Distribution" icon={<BarChart3 className="h-5 w-5 text-primary" />} rows={useEntityBreakdowns(adapter.dashboardKey, filters).data.breakdowns} empty="Relevant breakdowns will appear here." />; }
export function AnalyticsRanking({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) { return <EntityTable title="Rankings" icon={<ListOrdered className="h-5 w-5 text-primary" />} rows={useEntityRankings(adapter.dashboardKey, filters).data.rankings} empty="Top and underperforming related entities will appear here." />; }
export function AnalyticsCoverage({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) { return <EntityTable title="Coverage" icon={<ShieldCheck className="h-5 w-5 text-primary" />} rows={useEntityCoverage(adapter.dashboardKey, filters).data.coverage} empty="Provider, marketplace, geography and format coverage will appear here." />; }
export function AnalyticsComparison({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) { return <EntityTable title="Comparison" icon={<GitCompare className="h-5 w-5 text-primary" />} rows={useEntityComparisons(adapter.dashboardKey, filters).data.comparisons} empty="Entity comparison data will appear here when supported by backend analytics." />; }

export function RelatedOpportunities({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const rows = useEntityOpportunities(adapter.dashboardKey, filters).data.opportunities;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Related opportunities unavailable" description="Opportunity Analytics output will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Lightbulb className="h-5 w-5 text-primary" />} title="Related Opportunities" /><AnalyticsTable<EntityAnalyticsOpportunity & Record<string, unknown>> rows={rows as unknown as Array<EntityAnalyticsOpportunity & Record<string, unknown>>} columns={[{ key: 'title', header: 'Title' }, { key: 'score', header: 'Score', align: 'right', render: (value) => formatScore(value as number) }, { key: 'confidence', header: 'Confidence', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'priority', header: 'Priority', render: (value) => formatLabel(value as string) }]} /></DashboardPanel>;
}

export function RelatedAIInsights({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const rows = useEntityInsights(adapter.dashboardKey, filters).data.insights;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Related AI insights unavailable" description="Normalized AI Insight output will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Brain className="h-5 w-5 text-primary" />} title="Related AI Insights" /><AnalyticsTable<EntityAnalyticsInsight & Record<string, unknown>> rows={rows as unknown as Array<EntityAnalyticsInsight & Record<string, unknown>>} columns={[{ key: 'title', header: 'Insight' }, { key: 'confidence', header: 'Confidence', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'generatedAt', header: 'Generated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function AnalyticsActivity({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const rows = useEntityActivity(adapter.dashboardKey, filters).data.activity;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Recent activity unavailable" description="Entity activity will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Activity className="h-5 w-5 text-primary" />} title="Recent Activity" /><AnalyticsTable<EntityAnalyticsActivity & Record<string, unknown>> rows={rows as unknown as Array<EntityAnalyticsActivity & Record<string, unknown>>} columns={[{ key: 'title', header: 'Activity' }, { key: 'type', header: 'Type', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Time', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function AnalyticsFreshness({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  const rows = useEntityFreshness(adapter.dashboardKey, filters).data.freshness;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Freshness unavailable" description="Entity analytics freshness will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<RefreshCw className="h-5 w-5 text-primary" />} title="Freshness" /><AnalyticsTable<EntityAnalyticsFreshness & Record<string, unknown>> rows={rows as unknown as Array<EntityAnalyticsFreshness & Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Updated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function AnalyticsHealth({ adapter, filters }: { adapter: AnalyticsEntityAdapter; filters: DashboardFilters }) {
  return <DashboardPanel><SectionTitle icon={<HeartPulse className="h-5 w-5 text-primary" />} title="Analytics Health" /><WidgetPartialDataState completeness={useEntityAnalytics(adapter.dashboardKey, filters).data.metadata?.completeness} /></DashboardPanel>;
}
