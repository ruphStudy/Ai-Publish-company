import { Link } from 'react-router-dom';
import { AlertTriangle, Brain, ExternalLink, HeartPulse, Lightbulb, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsChart } from '@/features/analytics-dashboard/components/dashboard-charts';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatDate, formatLabel, formatPercentage, formatScore } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import type { ExecutiveAttentionItem, ExecutiveBreakdownItem, ExecutiveDashboardResponse, ExecutiveFreshnessItem, ExecutiveInsightItem, ExecutiveOpportunityItem, ExecutiveRiskItem } from '../types';
import { useExecutiveDashboard, useExecutiveKPIs } from '../hooks/use-executive-dashboard-queries';
import { ExecutiveWarningBanner } from './executive-dashboard-states';

export function ExecutiveDashboardSummary({ filters }: { filters: DashboardFilters }) {
  const { data } = useExecutiveDashboard(filters);
  const summary = data.summary;
  if (!summary?.summary) return <DashboardPanel><ExecutiveWarningBanner message="AI-generated executive summary is unavailable until AI Insights exposes a validated executive summary response." /></DashboardPanel>;
  return (
    <DashboardPanel>
      <div className="mb-3 flex items-center gap-2"><Brain className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">AI Executive Summary</h2><Badge variant="outline">AI-generated</Badge></div>
      <p className="text-sm leading-6 text-muted-foreground">{summary.summary}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {[
          ['Strongest area', summary.strongestPerformanceArea],
          ['Weakest area', summary.weakestPerformanceArea],
          ['Growth driver', summary.mainGrowthDriver],
          ['Main risk', summary.mainRisk],
          ['Priority opportunity', summary.highestPriorityOpportunity],
          ['Recommended focus', summary.recommendedFocus],
        ].map(([label, value]) => value ? <div key={label} className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div> : null)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Confidence {formatPercentage(summary.confidence)} • Generated {formatDate(summary.generatedAt)}</p>
    </DashboardPanel>
  );
}

export function ExecutiveKPISection({ filters }: { filters: DashboardFilters }) {
  const { data } = useExecutiveKPIs(filters);
  if (!data.length) return <DashboardPanel><WidgetEmptyState title="Executive KPIs unavailable" description="No backend executive KPI aggregate is currently exposed." /></DashboardPanel>;
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.map((item) => <DashboardKPI key={item.key} value={item} />)}</section>;
}

export function ExecutivePortfolioHealthSection({ filters }: { filters: DashboardFilters }) {
  const { data } = useExecutiveDashboard(filters);
  const health = data.portfolioHealth;
  if (!health?.dimensions.length) return <DashboardPanel><WidgetEmptyState title="Portfolio health unavailable" description="No official backend portfolio health score is available; no frontend composite score is calculated." /></DashboardPanel>;
  return (
    <DashboardPanel>
      <div className="mb-4 flex items-center justify-between"><div className="flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary" /><h2 className="text-lg font-semibold">Portfolio Health</h2></div><Badge>{formatLabel(health.overallStatus)}</Badge></div>
      {health.overallScore !== undefined && health.overallScore !== null && <Progress value={health.overallScore} className="mb-4" />}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{health.dimensions.map((dimension) => <div key={dimension.key} className="rounded-lg border p-3"><div className="flex items-center justify-between gap-2"><p className="font-medium">{dimension.label}</p><Badge variant="outline">{formatLabel(dimension.status)}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{dimension.description ?? 'No detail available'}</p>{dimension.score !== undefined && dimension.score !== null && <p className="mt-2 text-xs">{formatScore(dimension.score)}</p>}</div>)}</div>
    </DashboardPanel>
  );
}

export function ExecutivePerformanceTrendSection({ filters }: { filters: DashboardFilters }) {
  const { data } = useExecutiveDashboard(filters);
  const trend = data.trend;
  const points = trend?.series?.[0]?.points.map((point) => ({ label: point.date, value: point.value ?? null, comparison: point.comparisonValue ?? null })) ?? [];
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Performance trend unavailable" description="No executive trend series is currently available." /></DashboardPanel>;
  return <DashboardPanel><h2 className="mb-4 text-lg font-semibold">Performance Trend</h2><AnalyticsChart type="line" data={points} series={[{ key: 'value', label: 'Current' }, { key: 'comparison', label: 'Comparison' }]} title="Executive performance trend" /></DashboardPanel>;
}

function RankingTable<T extends ExecutiveBreakdownItem | ExecutiveAttentionItem>({ title, rows }: { title: string; rows?: T[] }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description="No matching executive-sized result set is currently available." /></DashboardPanel>;
  return (
    <DashboardPanel>
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <AnalyticsTable rows={rows as Array<Record<string, unknown>>} columns={[
        { key: 'label' in rows[0] ? 'label' : 'title', header: 'Name' },
        { key: 'contribution' in rows[0] ? 'contribution' : 'primaryMetric', header: 'Metric', align: 'right' },
        { key: 'growth', header: 'Growth', align: 'right', render: (value) => typeof value === 'number' ? formatPercentage(value) : '—' },
      ]} />
    </DashboardPanel>
  );
}

export function ExecutiveTopBooksSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Top Books" rows={useExecutiveDashboard(filters).data.topBooks} />; }
export function ExecutiveUnderperformingBooksSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Books Needing Attention" rows={useExecutiveDashboard(filters).data.underperformingBooks} />; }
export function ExecutiveProviderOverviewSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Provider Overview" rows={useExecutiveDashboard(filters).data.providers} />; }
export function ExecutiveMarketplaceOverviewSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Marketplace Overview" rows={useExecutiveDashboard(filters).data.marketplaces} />; }
export function ExecutiveGeographicOverviewSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Geographic Overview" rows={useExecutiveDashboard(filters).data.geographies} />; }
export function ExecutiveFormatOverviewSection({ filters }: { filters: DashboardFilters }) { return <RankingTable title="Format Overview" rows={useExecutiveDashboard(filters).data.formats} />; }

function CardList<T extends { id: string; title: string; drillDownPath?: string }>({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows?: T[]; empty: string }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return (
    <DashboardPanel>
      <div className="mb-4 flex items-center gap-2">{icon}<h2 className="text-lg font-semibold">{title}</h2></div>
      <div className="space-y-3">{rows.slice(0, 5).map((item) => <div key={item.id} className="rounded-lg border p-3"><div className="flex items-start justify-between gap-3"><p className="font-medium">{item.title}</p>{item.drillDownPath && <Button asChild size="sm" variant="ghost"><Link to={item.drillDownPath}><ExternalLink className="h-4 w-4" /></Link></Button>}</div></div>)}</div>
    </DashboardPanel>
  );
}

export function ExecutiveOpportunitySection({ filters }: { filters: DashboardFilters }) { return <CardList<ExecutiveOpportunityItem> title="Priority Opportunities" icon={<Lightbulb className="h-5 w-5 text-primary" />} rows={useExecutiveDashboard(filters).data.opportunities} empty="No Opportunity Analytics executive opportunity feed is currently exposed." />; }
export function ExecutiveAIInsightsSection({ filters }: { filters: DashboardFilters }) { return <CardList<ExecutiveInsightItem> title="AI Insights" icon={<Brain className="h-5 w-5 text-primary" />} rows={useExecutiveDashboard(filters).data.insights} empty="No validated AI insight feed is currently available." />; }
export function ExecutiveRiskSection({ filters }: { filters: DashboardFilters }) { return <CardList<ExecutiveRiskItem> title="Business Risks" icon={<ShieldAlert className="h-5 w-5 text-destructive" />} rows={useExecutiveDashboard(filters).data.risks} empty="No backend executive risk feed is currently available." />; }
export function ExecutiveAlertsSection({ filters }: { filters: DashboardFilters }) { return <CardList title="Alerts" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} rows={useExecutiveDashboard(filters).data.alerts} empty="No executive alert API is currently available." />; }
export function ExecutiveActivitySection({ filters }: { filters: DashboardFilters }) { return <CardList title="Recent Activity" icon={<ExternalLink className="h-5 w-5 text-primary" />} rows={useExecutiveDashboard(filters).data.activity} empty="No executive activity feed is currently available." />; }

export function ExecutiveFreshnessSection({ filters }: { filters: DashboardFilters }) {
  const rows = useExecutiveDashboard(filters).data.freshness;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Freshness unavailable" description="No executive freshness status endpoint is currently available." /></DashboardPanel>;
  return <DashboardPanel><h2 className="mb-4 text-lg font-semibold">Data Freshness</h2><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'timestamp', header: 'Last updated', render: (value) => formatDate(value as string) }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }]} /></DashboardPanel>;
}

export function ExecutiveOperationalWarningsSection({ filters }: { filters: DashboardFilters }) {
  return <CardList title="Operational Warnings" icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} rows={useExecutiveDashboard(filters).data.warnings} empty="No executive-impacting operational warnings are currently available." />;
}
