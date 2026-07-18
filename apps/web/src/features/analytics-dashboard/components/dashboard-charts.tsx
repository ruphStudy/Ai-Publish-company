import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { AreaChart } from '@/components/charts/area-chart';
import { WidgetEmptyState, WidgetErrorState, WidgetLoadingState, WidgetPartialDataState } from './dashboard-states';
import type { ChartDataPoint, ChartSeries, DashboardDataCompleteness } from '../types';

interface ChartWrapperProps {
  type: 'line' | 'area' | 'bar' | 'pie' | 'donut';
  data?: ChartDataPoint[];
  series?: ChartSeries[];
  xKey?: string;
  loading?: boolean;
  error?: unknown;
  completeness?: DashboardDataCompleteness;
  title?: string;
  description?: string;
}

export function AnalyticsChart({ type, data = [], series = [], xKey = 'label', loading, error, completeness, title, description }: ChartWrapperProps) {
  if (loading) return <WidgetLoadingState />;
  if (error) return <WidgetErrorState error={error} />;
  if (!data.length) return <WidgetEmptyState title="No chart data" description="No matching data is available for the selected filters." />;
  const rechartsSeries = series.map((item) => ({ key: item.key, label: item.label, color: item.color }));
  return (
    <figure aria-label={title} aria-describedby={description ? `${title}-description` : undefined}>
      <WidgetPartialDataState completeness={completeness} />
      {description && <figcaption id={`${title}-description`} className="sr-only">{description}</figcaption>}
      {type === 'line' && <LineChart data={data} series={rechartsSeries} xKey={xKey} showLegend />}
      {type === 'area' && <AreaChart data={data} series={rechartsSeries} xKey={xKey} showLegend />}
      {type === 'bar' && <BarChart data={data} series={rechartsSeries} xKey={xKey} showLegend />}
      {(type === 'pie' || type === 'donut') && <PieChart data={data.map((point) => ({ name: point.label, value: Number(point.value ?? 0) }))} />}
    </figure>
  );
}
