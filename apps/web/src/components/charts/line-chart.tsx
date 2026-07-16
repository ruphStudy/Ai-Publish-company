import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
  ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

interface LineSeries {
  key: string;
  label: string;
  color?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
}

interface LineChartProps {
  data: Record<string, unknown>[];
  series: LineSeries[];
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
  referenceLines?: Array<{ value: number; label?: string; color?: string }>;
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

export function LineChart({
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
  referenceLines = [],
}: LineChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
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
            <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
          )}
          {referenceLines.map((ref, i) => (
            <ReferenceLine
              key={i}
              y={ref.value}
              stroke={ref.color ?? 'hsl(var(--muted-foreground))'}
              strokeDasharray="4 4"
              label={{ value: ref.label, fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            />
          ))}
          {series.map((s, i) => {
            const color = s.color ?? defaultColors[i % defaultColors.length];
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={s.strokeWidth ?? 2}
                strokeDasharray={s.strokeDasharray}
                dot={s.dot ?? false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            );
          })}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
