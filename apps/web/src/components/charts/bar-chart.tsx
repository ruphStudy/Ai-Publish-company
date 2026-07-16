import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
  Cell,
} from 'recharts';
import { cn } from '@/lib/utils';

interface BarSeries {
  key: string;
  label: string;
  color?: string;
  radius?: number;
}

interface BarChartProps {
  data: Record<string, unknown>[];
  series: BarSeries[];
  xKey: string;
  height?: number;
  layout?: 'vertical' | 'horizontal';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  className?: string;
  yAxisFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  grouped?: boolean;
  colorByValue?: (value: number) => string;
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

export function BarChart({
  data,
  series,
  xKey,
  height = 300,
  layout = 'horizontal',
  showGrid = true,
  showLegend = false,
  showTooltip = true,
  showXAxis = true,
  showYAxis = true,
  className,
  yAxisFormatter = (v) => v.toLocaleString(),
  xAxisFormatter,
  grouped = false,
  colorByValue,
}: BarChartProps) {
  const isVertical = layout === 'vertical';

  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 4, right: 4, left: isVertical ? 60 : -16, bottom: 0 }}
          barGap={grouped ? 4 : 0}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              horizontal={!isVertical}
              vertical={isVertical}
            />
          )}
          {showXAxis && (
            <XAxis
              dataKey={isVertical ? undefined : xKey}
              type={isVertical ? 'number' : 'category'}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={isVertical ? yAxisFormatter : xAxisFormatter}
            />
          )}
          {showYAxis && (
            <YAxis
              dataKey={isVertical ? xKey : undefined}
              type={isVertical ? 'category' : 'number'}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={isVertical ? undefined : yAxisFormatter}
              width={isVertical ? 100 : 48}
            />
          )}
          {showTooltip && <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }} />}
          {showLegend && (
            <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
          )}
          {series.map((s, i) => {
            const color = s.color ?? defaultColors[i % defaultColors.length];
            return (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label}
                fill={color}
                radius={[s.radius ?? 4, s.radius ?? 4, 0, 0]}
              >
                {colorByValue &&
                  data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={colorByValue(entry[s.key] as number)}
                    />
                  ))}
              </Bar>
            );
          })}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
