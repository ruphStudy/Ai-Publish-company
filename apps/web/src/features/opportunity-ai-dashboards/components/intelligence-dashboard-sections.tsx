import { Brain, Gauge, Lightbulb, ListChecks, PieChart, RefreshCw, Sparkles } from 'lucide-react';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsChart } from '@/features/analytics-dashboard/components/dashboard-charts';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatDate, formatLabel, formatNumber, formatPercentage, formatScore } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import type { AIInsightQueueItem, IntelligenceDistributionItem, IntelligenceFreshnessItem, OpportunityQueueItem } from '../types';
import { useAIInsightDistributions, useAIInsightFreshness, useAIInsightKPIs, useAIInsightLists, useAIInsightTrend, useOpportunityDistributions, useOpportunityFreshness, useOpportunityKPIs, useOpportunityLists, useOpportunitySummary, useOpportunityTrend } from '../hooks/use-intelligence-dashboard-queries';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="mb-4 flex items-center gap-2 text-lg font-semibold">{icon}<h2>{title}</h2></div>;
}

export function OpportunitySummary({ filters }: { filters: DashboardFilters }) {
  const data = useOpportunitySummary(filters).data;
  return <DashboardPanel><WidgetPartialDataState completeness={data.metadata?.completeness} /><SectionTitle icon={<Lightbulb className="h-5 w-5 text-primary" />} title="Opportunity Summary" /><p className="text-sm text-muted-foreground">{data.summary ?? 'Opportunity Analytics summary will appear here when backend aggregates are available.'}</p></DashboardPanel>;
}

export function OpportunityKPIs({ filters }: { filters: DashboardFilters }) {
  const items = useOpportunityKPIs(filters).data.kpis ?? [];
  if (!items.length) return <DashboardPanel><WidgetEmptyState title="Opportunity KPIs unavailable" description="Opportunity KPI aggregates will appear here." /></DashboardPanel>;
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <DashboardKPI key={item.label} value={item} />)}</section>;
}

export function OpportunityTrend({ filters }: { filters: DashboardFilters }) {
  const points = (useOpportunityTrend(filters).data.trend ?? []).map((point) => ({ label: point.date, current: point.current ?? null, comparison: point.comparison ?? null }));
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Opportunity trend unavailable" description="Opportunity trend data will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Gauge className="h-5 w-5 text-primary" />} title="Opportunity Trend" /><AnalyticsChart type="line" data={points} series={[{ key: 'current', label: 'Current' }, { key: 'comparison', label: 'Comparison' }]} title="Opportunity trend" /></DashboardPanel>;
}

function DistributionSection({ title, rows }: { title: string; rows?: IntelligenceDistributionItem[] }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description="Distribution data will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<PieChart className="h-5 w-5 text-primary" />} title={title} /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Name' }, { key: 'value', header: 'Value', align: 'right', render: (value) => formatNumber(value as number) }, { key: 'percentage', header: 'Share', align: 'right', render: (value) => formatPercentage(value as number) }]} /></DashboardPanel>;
}

export function OpportunityPriorityDistribution({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Priority Distribution" rows={useOpportunityDistributions(filters).data.priorityDistribution} />; }
export function OpportunityCategories({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Opportunity Categories" rows={useOpportunityDistributions(filters).data.categories} />; }
export function OpportunityEntityDistribution({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Entity Distribution" rows={useOpportunityDistributions(filters).data.entityDistribution} />; }
export function OpportunityEstimatedImpact({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Estimated Impact" rows={useOpportunityDistributions(filters).data.estimatedImpact} />; }
export function OpportunityConfidenceDistribution({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Confidence Distribution" rows={useOpportunityDistributions(filters).data.confidenceDistribution} />; }

function OpportunityList({ title, rows }: { title: string; rows?: OpportunityQueueItem[] }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description="Opportunity records will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<ListChecks className="h-5 w-5 text-primary" />} title={title} /><AnalyticsTable<OpportunityQueueItem & Record<string, unknown>> rows={rows as unknown as Array<OpportunityQueueItem & Record<string, unknown>>} columns={[{ key: 'title', header: 'Title' }, { key: 'priority', header: 'Priority', render: (value) => formatLabel(value as string) }, { key: 'score', header: 'Score', align: 'right', render: (value) => formatScore(value as number) }, { key: 'confidence', header: 'Confidence', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }]} /></DashboardPanel>;
}

export function OpportunityQueue({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Opportunity Queue" rows={useOpportunityLists(filters).data.queue} />; }
export function RecentlyDetectedOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Recently Detected" rows={useOpportunityLists(filters).data.recentlyDetected} />; }
export function RecentlyUpdatedOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Recently Updated" rows={useOpportunityLists(filters).data.recentlyUpdated} />; }
export function AcceptedOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Accepted" rows={useOpportunityLists(filters).data.accepted} />; }
export function InProgressOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="In Progress" rows={useOpportunityLists(filters).data.inProgress} />; }
export function ResolvedOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Resolved" rows={useOpportunityLists(filters).data.resolved} />; }
export function IgnoredOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Ignored" rows={useOpportunityLists(filters).data.ignored} />; }
export function ExpiringOpportunities({ filters }: { filters: DashboardFilters }) { return <OpportunityList title="Expiring Opportunities" rows={useOpportunityLists(filters).data.expiring} />; }

export function OpportunityFreshness({ filters }: { filters: DashboardFilters }) {
  const rows = useOpportunityFreshness(filters).data.freshness;
  return <FreshnessTable title="Opportunity Freshness" rows={rows} />;
}

export function AIInsightKPIs({ filters }: { filters: DashboardFilters }) {
  const items = useAIInsightKPIs(filters).data.kpis ?? [];
  if (!items.length) return <DashboardPanel><WidgetEmptyState title="AI Insight KPIs unavailable" description="AI Insight KPI aggregates will appear here." /></DashboardPanel>;
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{items.map((item) => <DashboardKPI key={item.label} value={item} />)}</section>;
}

export function AIInsightTrend({ filters }: { filters: DashboardFilters }) {
  const points = (useAIInsightTrend(filters).data.trend ?? []).map((point) => ({ label: point.date, current: point.current ?? null, comparison: point.comparison ?? null }));
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Insight trend unavailable" description="AI insight trend data will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Sparkles className="h-5 w-5 text-primary" />} title="Insight Trend" /><AnalyticsChart type="line" data={points} series={[{ key: 'current', label: 'Current' }, { key: 'comparison', label: 'Comparison' }]} title="AI insight trend" /></DashboardPanel>;
}

export function InsightCategories({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Insight Categories" rows={useAIInsightDistributions(filters).data.categories} />; }
export function InsightConfidenceDistribution({ filters }: { filters: DashboardFilters }) { return <DistributionSection title="Insight Confidence Distribution" rows={useAIInsightDistributions(filters).data.confidenceDistribution} />; }

function InsightList({ title, rows }: { title: string; rows?: AIInsightQueueItem[] }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description="Validated normalized AI insights will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Brain className="h-5 w-5 text-primary" />} title={title} /><p className="mb-3 text-xs text-muted-foreground">AI-generated content</p><AnalyticsTable<AIInsightQueueItem & Record<string, unknown>> rows={rows as unknown as Array<AIInsightQueueItem & Record<string, unknown>>} columns={[{ key: 'title', header: 'Insight' }, { key: 'category', header: 'Category', render: (value) => formatLabel(value as string) }, { key: 'confidence', header: 'Confidence', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'generatedAt', header: 'Generated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function ExecutiveInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Executive Insights" rows={useAIInsightLists(filters).data.executiveInsights} />; }
export function UserInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="User Insights" rows={useAIInsightLists(filters).data.userInsights} />; }
export function GrowthInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Growth Insights" rows={useAIInsightLists(filters).data.growthInsights} />; }
export function RiskInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Risk Insights" rows={useAIInsightLists(filters).data.riskInsights} />; }
export function PerformanceInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Performance Insights" rows={useAIInsightLists(filters).data.performanceInsights} />; }
export function PublishingInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Publishing Insights" rows={useAIInsightLists(filters).data.publishingInsights} />; }
export function MetadataInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Metadata Insights" rows={useAIInsightLists(filters).data.metadataInsights} />; }
export function OpportunityRecommendations({ filters }: { filters: DashboardFilters }) { return <InsightList title="Opportunity Recommendations" rows={useAIInsightLists(filters).data.opportunityRecommendations} />; }
export function RecentInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Recent Insights" rows={useAIInsightLists(filters).data.recentInsights} />; }
export function StaleInsights({ filters }: { filters: DashboardFilters }) { return <InsightList title="Stale Insights" rows={useAIInsightLists(filters).data.staleInsights} />; }

export function InsightFreshness({ filters }: { filters: DashboardFilters }) {
  return <FreshnessTable title="Insight Freshness" rows={useAIInsightFreshness(filters).data.freshness} />;
}

function FreshnessTable({ title, rows }: { title: string; rows?: IntelligenceFreshnessItem[] }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description="Freshness metadata will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<RefreshCw className="h-5 w-5 text-primary" />} title={title} /><AnalyticsTable<IntelligenceFreshnessItem & Record<string, unknown>> rows={rows as unknown as Array<IntelligenceFreshnessItem & Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Updated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}
