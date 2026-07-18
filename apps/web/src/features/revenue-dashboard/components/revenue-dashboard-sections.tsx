import { Activity, Banknote, BookOpen, Globe2, Layers, LineChart, Receipt, RefreshCw, Repeat, Store, WalletCards } from 'lucide-react';
import { DashboardKPI } from '@/features/analytics-dashboard/components/dashboard-kpi';
import { AnalyticsChart } from '@/features/analytics-dashboard/components/dashboard-charts';
import { AnalyticsTable } from '@/features/analytics-dashboard/components/analytics-table';
import { DashboardPanel } from '@/features/analytics-dashboard/components/dashboard-layout';
import { WidgetEmptyState, WidgetPartialDataState } from '@/features/analytics-dashboard/components/dashboard-states';
import { formatCurrency, formatDate, formatLabel, formatNumber, formatPercentage } from '@/features/analytics-dashboard/lib/formatters';
import type { DashboardFilters, KPIValue } from '@/features/analytics-dashboard/types';
import type { CurrencyCoverageItem, RefundAdjustmentItem, RevenueActivityItem, RevenueBreakdownItem, RevenueFreshnessItem } from '../types';
import { useCurrencyCoverage, useRecentRevenueActivity, useRefundAdjustmentAnalysis, useRevenueBookEditionRanking, useRevenueDistribution, useRevenueFormatBreakdown, useRevenueFreshness, useRevenueGeographicBreakdown, useRevenueMarketplaceBreakdown, useRevenueOverview, useRevenueProviderBreakdown, useRevenueTrend } from '../hooks/use-revenue-dashboard-queries';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return <div className="mb-4 flex items-center gap-2 text-lg font-semibold">{icon}<h2>{title}</h2></div>;
}

export function RevenueOverview({ filters }: { filters: DashboardFilters }) {
  const overview = useRevenueOverview(filters).data.overview;
  if (!overview) return <DashboardPanel><WidgetEmptyState title="Revenue overview unavailable" description="No backend revenue overview aggregate is currently exposed." /></DashboardPanel>;
  const items = [overview.grossRevenue, overview.netRevenue, overview.refundValue, overview.adjustments, overview.averageRevenuePerSale, overview.revenueGrowth, overview.revenueGeneratingBooks, overview.revenueGeneratingProviders, overview.revenueGeneratingMarketplaces].filter((item): item is KPIValue => Boolean(item));
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><WidgetPartialDataState completeness={overview.metadata?.completeness} />{items.map((item) => <DashboardKPI key={item.label} value={{ ...item, currency: item.currency ?? filters.currencyCode }} />)}</section>;
}

export function RevenueTrend({ filters }: { filters: DashboardFilters }) {
  const trend = useRevenueTrend(filters).data.trend;
  const points = trend?.points.map((point) => ({ label: point.date, grossRevenue: point.grossRevenue ?? null, netRevenue: point.netRevenue ?? null, refunds: point.refunds ?? null, adjustments: point.adjustments ?? null, comparison: point.comparisonNetRevenue ?? null })) ?? [];
  if (!points.length) return <DashboardPanel><WidgetEmptyState title="Revenue trend unavailable" description="No revenue time-series endpoint is currently available." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<LineChart className="h-5 w-5 text-primary" />} title="Revenue Trend" /><AnalyticsChart type="line" data={points} series={[{ key: 'grossRevenue', label: 'Gross revenue' }, { key: 'netRevenue', label: 'Net revenue' }, { key: 'refunds', label: 'Refunds' }, { key: 'adjustments', label: 'Adjustments' }, { key: 'comparison', label: 'Comparison' }]} title="Revenue trend" /></DashboardPanel>;
}

function RevenueBreakdownSection({ title, icon, rows, empty, currency }: { title: string; icon: React.ReactNode; rows?: RevenueBreakdownItem[]; empty: string; currency?: string }) {
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title={`${title} unavailable`} description={empty} /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={icon} title={title} /><AnalyticsTable rows={rows as unknown as Array<Record<string, unknown>>} columns={[{ key: 'label', header: 'Name' }, { key: 'grossRevenue', header: 'Gross', align: 'right', render: (value) => formatCurrency(value as number, currency) }, { key: 'netRevenue', header: 'Net', align: 'right', render: (value) => formatCurrency(value as number, currency) }, { key: 'contributionPercentage', header: 'Contribution', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'growth', header: 'Growth', align: 'right', render: (value) => formatPercentage(value as number) }]} /></DashboardPanel>;
}

export function RevenueByBookAndEdition({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue by Book and Edition" icon={<BookOpen className="h-5 w-5 text-primary" />} rows={useRevenueBookEditionRanking(filters).data.booksAndEditions} empty="Book and edition revenue rankings will appear here." currency={filters.currencyCode} />; }
export function RevenueByProvider({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue by Provider" icon={<Layers className="h-5 w-5 text-primary" />} rows={useRevenueProviderBreakdown(filters).data.providers} empty="Provider revenue breakdown will appear here." currency={filters.currencyCode} />; }
export function RevenueByMarketplace({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue by Marketplace" icon={<Store className="h-5 w-5 text-primary" />} rows={useRevenueMarketplaceBreakdown(filters).data.marketplaces} empty="Marketplace revenue breakdown will appear here." currency={filters.currencyCode} />; }
export function RevenueByCountryTerritory({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue by Country/Territory" icon={<Globe2 className="h-5 w-5 text-primary" />} rows={useRevenueGeographicBreakdown(filters).data.geographies} empty="Country and territory revenue breakdown will appear here." currency={filters.currencyCode} />; }
export function RevenueByFormat({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue by Format" icon={<WalletCards className="h-5 w-5 text-primary" />} rows={useRevenueFormatBreakdown(filters).data.formats} empty="Format revenue breakdown will appear here." currency={filters.currencyCode} />; }
export function RevenueDistribution({ filters }: { filters: DashboardFilters }) { return <RevenueBreakdownSection title="Revenue Distribution" icon={<Banknote className="h-5 w-5 text-primary" />} rows={useRevenueDistribution(filters).data.distribution} empty="Configurable revenue distribution will appear here." currency={filters.currencyCode} />; }

export function RefundAdjustmentAnalysis({ filters }: { filters: DashboardFilters }) {
  const rows = useRefundAdjustmentAnalysis(filters).data.refundsAndAdjustments;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Refund and adjustment analysis unavailable" description="Refund, adjustment, rate, source and affected entity data will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Receipt className="h-5 w-5 text-primary" />} title="Refund and Adjustment Analysis" /><AnalyticsTable<RefundAdjustmentItem & Record<string, unknown>> rows={rows as unknown as Array<RefundAdjustmentItem & Record<string, unknown>>} columns={[{ key: 'source', header: 'Source' }, { key: 'entity', header: 'Entity' }, { key: 'amount', header: 'Amount', align: 'right', render: (value) => formatCurrency(value as number, filters.currencyCode) }, { key: 'rate', header: 'Rate', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'timestamp', header: 'Date', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function CurrencyCoverage({ filters }: { filters: DashboardFilters }) {
  const rows = useCurrencyCoverage(filters).data.currencyCoverage;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Currency coverage unavailable" description="Reporting currency, source currencies, conversion coverage and missing rates will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Repeat className="h-5 w-5 text-primary" />} title="Currency Coverage" /><AnalyticsTable<CurrencyCoverageItem & Record<string, unknown>> rows={rows as unknown as Array<CurrencyCoverageItem & Record<string, unknown>>} columns={[{ key: 'sourceCurrency', header: 'Source' }, { key: 'reportingCurrency', header: 'Reporting' }, { key: 'conversionCoverage', header: 'Coverage', align: 'right', render: (value) => formatPercentage(value as number) }, { key: 'missingRates', header: 'Missing rates', align: 'right', render: (value) => formatNumber(value as number) }, { key: 'convertedAt', header: 'Converted', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function RevenueDataFreshness({ filters }: { filters: DashboardFilters }) {
  const rows = useRevenueFreshness(filters).data.freshness;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Revenue freshness unavailable" description="Revenue normalization and currency-conversion freshness will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<RefreshCw className="h-5 w-5 text-primary" />} title="Revenue Data Freshness" /><AnalyticsTable<RevenueFreshnessItem & Record<string, unknown>> rows={rows as unknown as Array<RevenueFreshnessItem & Record<string, unknown>>} columns={[{ key: 'label', header: 'Source' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Updated', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}

export function RecentRevenueActivity({ filters }: { filters: DashboardFilters }) {
  const rows = useRecentRevenueActivity(filters).data.activity;
  if (!rows?.length) return <DashboardPanel><WidgetEmptyState title="Recent revenue activity unavailable" description="Revenue-related activity will appear here." /></DashboardPanel>;
  return <DashboardPanel><SectionTitle icon={<Activity className="h-5 w-5 text-primary" />} title="Recent Revenue Activity" /><AnalyticsTable<RevenueActivityItem & Record<string, unknown>> rows={rows as unknown as Array<RevenueActivityItem & Record<string, unknown>>} columns={[{ key: 'title', header: 'Activity' }, { key: 'status', header: 'Status', render: (value) => formatLabel(value as string) }, { key: 'timestamp', header: 'Time', render: (value) => formatDate(value as string) }]} /></DashboardPanel>;
}
