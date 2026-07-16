import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

interface AreaChartSeries {
  key: string;
  label: string;
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
}

interface AreaChartProps {
  data: Record<string, unknown>[];
  series: AreaChartSeries[];
  xKey: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  stacked?: boolean;
}

const defaultColors = [
  'hsl(239 84% 67%)',
  'hsl(262 83% 58%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(0 84% 60%)',
];

function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold">{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export function AreaChart({
  data,
  series,
  xKey,
  height = 300,
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  className,
  yAxisFormatter = (v) => v.toLocaleString(),
  xAxisFormatter,
  stacked = false,
}: AreaChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <defs>
            {series.map((s, i) => {
              const color = s.color ?? defaultColors[i % defaultColors.length];
              return (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={xAxisFormatter}
            />
          )}
          {showYAxis && (
            <YAxis
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={yAxisFormatter}
            />
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))' }} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
            />
          )}
          {series.map((s, i) => {
            const color = s.color ?? defaultColors[i % defaultColors.length];
            return (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={s.strokeWidth ?? 2}
                fill={`url(#gradient-${s.key})`}
                fillOpacity={s.fillOpacity ?? 1}
                stackId={stacked ? 'stack' : undefined}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
