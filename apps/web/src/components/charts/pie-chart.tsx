import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from 'recharts';
import { cn } from '@/lib/utils';

interface PieChartDataItem {
  name: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartDataItem[];
  height?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showLabels?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

const defaultColors = [
  'hsl(239 84% 67%)',
  'hsl(262 83% 58%)',
  'hsl(142 76% 36%)',
  'hsl(38 92% 50%)',
  'hsl(0 84% 60%)',
  'hsl(199 89% 48%)',
];

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full" style={{ background: entry.payload.fill }} />
        <span className="text-muted-foreground">{entry.name}:</span>
        <span className="font-semibold">{entry.value?.toLocaleString()}</span>
      </div>
    </div>
  );
}

const RADIAN = Math.PI / 180;

function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number; percent: number;
}) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function PieChart({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = '80%',
  showLegend = true,
  showTooltip = true,
  showLabels = false,
  className,
  valueFormatter,
}: PieChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
              formatter={(value) =>
                valueFormatter
                  ? `${value} (${valueFormatter(data.find((d) => d.name === value)?.value ?? 0)})`
                  : value
              }
            />
          )}
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={showLabels ? renderCustomLabel : undefined}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color ?? defaultColors[index % defaultColors.length]}
                strokeWidth={0}
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
