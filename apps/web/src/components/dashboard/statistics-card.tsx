import { type LucideIcon, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatisticItem {
  label: string;
  value: string | number;
  unit?: string;
}

interface StatisticsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  trend?: number;
  trendLabel?: string;
  badge?: { label: string; variant?: 'default' | 'secondary' | 'outline' | 'destructive' };
  statistics?: StatisticItem[];
  actionLabel?: string;
  onAction?: () => void;
  isLoading?: boolean;
  accent?: boolean;
  className?: string;
}

export function StatisticsCard({
  title,
  value,
  description,
  icon: Icon,
  iconClassName,
  trend,
  trendLabel,
  badge,
  statistics = [],
  actionLabel,
  onAction,
  isLoading = false,
  accent = false,
  className,
}: StatisticsCardProps) {
  const TrendIcon =
    trend !== undefined
      ? trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus
      : null;

  const trendColor =
    trend !== undefined
      ? trend > 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : trend < 0
          ? 'text-destructive'
          : 'text-muted-foreground'
      : '';

  return (
    <Card
      className={cn(
        accent && 'border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5',
        className,
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  accent ? 'bg-primary/10' : 'bg-muted',
                )}
              >
                <Icon className={cn('h-5 w-5', accent ? 'text-primary' : 'text-muted-foreground', iconClassName)} />
              </div>
            )}
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          </div>

          {badge && !isLoading && (
            <Badge variant={badge.variant ?? 'outline'} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              {TrendIcon && trend !== undefined && (
                <span className={cn('flex items-center gap-0.5', trendColor)}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {trend > 0 ? '+' : ''}{trend}%
                </span>
              )}
              <span>{trendLabel ?? description}</span>
            </div>
          </>
        )}

        {!isLoading && statistics.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-4">
            {statistics.map((stat) => (
              <div key={stat.label}>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-semibold text-foreground">
                  {stat.value}
                  {stat.unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{stat.unit}</span>}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {actionLabel && onAction && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAction}
            className="h-8 w-full gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            {actionLabel}
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
