import { Activity, BarChart3, BookOpen, Gauge, Globe2, Layers, LineChart, RefreshCw, ShoppingCart, Store } from 'lucide-react';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsChart } from '@/features/analytics-dashboard/components/dashboard-charts';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatDate, formatLabel, formatNumber, formatPercentage, formatScore } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import type { KPIValue } from '@/features/analytics-dashboard/types';
import type { SalesActivityItem, SalesBreakdownItem, SalesFreshnessItem, SalesRankingItem } from '../types';
import { useCountrySalesPerformance, useFormatSalesPerformance, useMarketplaceSalesPerformance, useProviderSalesPerformance, useRecentSalesActivity, useSalesDashboard, useSalesDataFreshness, useSalesDistribution, useSalesOverview, useSalesTrend, useSalesVelocity, useTopSellingBooks, useUnderperformingSalesBooks } from '../hooks/use-sales-dashboard-queries';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="mb-4 flex items-center gap-2 text-lg font-semibold">{icon}<h2>{title}</h2></div>;
}

export function SalesOverview({ filters }: { filters: DashboardFilters }) {
  const overview = useSalesOverview(filters).data.overview;
  if (!overview) return <DashboardPanel><WidgetEmptyState title="Sales overview unavailable" description="No backend sales overview aggregate is currently exposed." /></DashboardPanel>;
  const items = [overview.unitsSold, overview.salesGrowth, overview.activeBooks, overview.activeEditions, overview.activeProviders, overview.activeMarketplaces, overview.activeCountries, overview.refundCount].filter((item): item is KPIValue => Boolean(item));
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WidgetPartialDataState completeness={overview.metadata?.completeness} />{items.map((item) => <DashboardKPI key={item.label} value={item} />)}</section>;
}

export function SalesTrend({ filters }: { filters: DashboardFilters }) {
  const trend = useSalesTrend(filters).data.trend;
  const points = trend?.points.map((point) => ({ label: point.date, unitsSold: point.unitsSold ?? null, comparison: point.comparisonUnitsSold ?? null, refunds: point.refunds ?? null })) ?? [];
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Sales trend unavailable" description="No sales time-series endpoint is currently available." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<LineChart className="h-5 w-5 text-primary" />} title="Sales Trend" /><AnalyticsChart type="line" data={points} series={[{ key: 'unitsSold', label: 'Units sold' }, { key: 'comparison', label: 'Comparison' }, { key: 'refunds', label: 'Refunds' }]} title="Sales trend" /></DashboardPanel>;
}

function RankingSection({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows?: SalesRankingItem[]; empty: string }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={icon} title={title} /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'title', header: 'Title' }, { key: 'unitsSold', header: 'Units', align: 'right', render: (value) => formatNumber(value as number) }, { key: 'contributionPercentage', header: 'Contribution', align: 'right', render: (value) => formatPercentage(value as number) }]} /></DashboardPanel>;
}

export function TopSellingBooks({ filters }: { filters: DashboardFilters }) { return <RankingSection title="Top Selling Books" icon={<BookOpen className="h-5 w-5 text-primary" />} rows={useTopSellingBooks(filters).data.topBooks} empty="Book sales rankings will appear here." />; }
export function UnderperformingBooks({ filters }: { filters: DashboardFilters }) {
  const rows = useUnderperformingSalesBooks(filters).data.underperformingBooks;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Underperforming books unavailable" description="Opportunity-backed sales attention items will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Gauge className="h-5 w-5 text-amber-500" />} title="Underperforming Books" /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'title', header: 'Title' }, { key: 'reason', header: 'Reason' }, { key: 'opportunityScore', header: 'Score', align: 'right', render: (value) => formatScore(value as number) }]} /></DashboardPanel>;
}

function BreakdownSection({ title, icon, rows, empty }: { title: string; icon: React.ReactNode; rows?: SalesBreakdownItem[]; empty: string }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={icon} title={title} /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Name' }, { key: 'unitsSold', header: 'Units', align: 'right', render: (value) => formatNumber(value as number) }, { key: 'contributionPercentage', header: 'Contribution', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'growth', header: 'Growth', align: 'right', render: (value) => formatPercentage(value as number) }]} /></DashboardPanel>;
}

export function MarketplacePerformance({ filters }: { filters: DashboardFilters }) { return <BreakdownSection title="Marketplace Performance" icon={<Store className="h-5 w-5 text-primary" />} rows={useMarketplaceSalesPerformance(filters).data.marketplaces} empty="Marketplace sales performance will appear here." />; }
export function ProviderPerformance({ filters }: { filters: DashboardFilters }) { return <BreakdownSection title="Provider Performance" icon={<Layers className="h-5 w-5 text-primary" />} rows={useProviderSalesPerformance(filters).data.providers} empty="Provider sales performance will appear here." />; }
export function CountryPerformance({ filters }: { filters: DashboardFilters }) { return <BreakdownSection title="Country Performance" icon={<Globe2 className="h-5 w-5 text-primary" />} rows={useCountrySalesPerformance(filters).data.countries} empty="Country sales performance will appear here." />; }
export function FormatPerformance({ filters }: { filters: DashboardFilters }) { return <BreakdownSection title="Format Performance" icon={<ShoppingCart className="h-5 w-5 text-primary" />} rows={useFormatSalesPerformance(filters).data.formats} empty="Format sales performance will appear here." />; }
export function SalesDistribution({ filters }: { filters: DashboardFilters }) { return <BreakdownSection title="Sales Distribution" icon={<BarChart3 className="h-5 w-5 text-primary" />} rows={useSalesDistribution(filters).data.distribution} empty="Configurable sales breakdowns will appear here." />; }

export function SalesVelocity({ filters }: { filters: DashboardFilters }) {
  const velocity = useSalesVelocity(filters).data.velocity;
  if (!velocity) return <DashboardPanel><WidgetEmptyState title="Sales velocity unavailable" description="Recent sales momentum will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Gauge className="h-5 w-5 text-primary" />} title="Sales Velocity" /><div className="grid gap-3 sm:grid-cols-3"><DashboardKPI value={{ label: 'Momentum', value: formatNumber(velocity.momentum) }} /><DashboardKPI value={{ label: 'Average daily sales', value: formatNumber(velocity.averageDailySales) }} /><DashboardKPI value={{ label: 'Recent units', value: formatNumber(velocity.recentUnitsSold), trend: velocity.trend }} /></div></DashboardPanel>;
}

export function RecentSalesActivity({ filters }: { filters: DashboardFilters }) {
  const rows = useRecentSalesActivity(filters).data.activity;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Recent sales activity unavailable" description="Sales activity history will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Activity className="h-5 w-5 text-primary" />} title="Recent Sales Activity" /><AnalyticsTable<SalesActivityItem & Record<string, unknown>> rows={rows as unknown as Array<SalesActivityItem & Record<string, unknown>>} columns={[{ key: 'title', header: 'Activity' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Time', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function SalesDataFreshness({ filters }: { filters: DashboardFilters }) {
  const rows = useSalesDataFreshness(filters).data.freshness;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Sales freshness unavailable" description="Sales data freshness and import coverage will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<RefreshCw className="h-5 w-5 text-primary" />} title="Sales Data Freshness" /><AnalyticsTable<SalesFreshnessItem & Record<string, unknown>> rows={rows as unknown as Array<SalesFreshnessItem & Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Updated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}
