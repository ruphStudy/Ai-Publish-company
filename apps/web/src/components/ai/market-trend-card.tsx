import { TrendingUp, TrendingDown, Minus, BarChart3, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart } from '@/components/charts/area-chart';
import { cn } from '@/lib/utils';

interface MarketTrendDataPoint {
  period: string;
  value: number;
  volume?: number;
  [key: string]: unknown;
}

interface MarketTrendCardProps {
  title: string;
  category: string;
  currentValue: string | number;
  previousValue?: string | number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'stable';
  period?: string;
  data?: MarketTrendDataPoint[];
  tags?: string[];
  description?: string;
  onViewTrend?: () => void;
  showChart?: boolean;
  className?: string;
}

export function MarketTrendCard({
  title,
  category,
  currentValue,
  previousValue,
  changePercent,
  trend,
  period = 'last 30 days',
  data = [],
  tags = [],
  description,
  onViewTrend,
  showChart = true,
  className,
}: MarketTrendCardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;

  const trendColor =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';

  const trendBg =
    trend === 'up'
      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950'
      : trend === 'down'
        ? 'border-destructive/30 bg-destructive/10'
        : 'border-border bg-muted';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{category}</p>
              <CardTitle className="text-sm">{title}</CardTitle>
            </div>
          </div>

          {trend && changePercent !== undefined && (
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1 text-xs', trendBg, trendColor)}
            >
              <TrendIcon className="h-3 w-3" />
              {Math.abs(changePercent)}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="mb-3 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{currentValue}</span>
          {previousValue !== undefined && (
            <span className="text-sm text-muted-foreground">vs {previousValue}</span>
          )}
        </div>

        <p className="mb-3 text-xs text-muted-foreground">{period}</p>

        {description && (
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}

        {showChart && data.length > 0 && (
          <div className="-mx-1">
            <AreaChart
              data={data}
              series={[
                {
                  key: 'value',
                  label: title,
                  color: trend === 'up'
                    ? 'hsl(142 76% 36%)'
                    : trend === 'down'
                      ? 'hsl(0 84% 60%)'
                      : 'hsl(239 84% 67%)',
                },
              ]}
              xKey="period"
              height={80}
              showGrid={false}
              showXAxis={false}
              showYAxis={false}
              showTooltip={true}
            />
          </div>
        )}

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      {onViewTrend && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewTrend}
            className="h-8 w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            View Full Trend
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
