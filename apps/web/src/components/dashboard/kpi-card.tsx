import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
  onClick?: () => void;
}

export function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendLabel,
  isLoading = false,
  className,
  valueClassName,
  onClick,
}: KpiCardProps) {
  const TrendIcon = trend !== undefined
    ? trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
    : null;

  const trendColor =
    trend !== undefined
      ? trend > 0
        ? 'text-emerald-600 dark:text-emerald-400'
        : trend < 0
          ? 'text-destructive'
          : 'text-muted-foreground'
      : undefined;

  return (
    <Card
      className={cn(
        'transition-shadow',
        onClick && 'cursor-pointer hover:shadow-md',
        className,
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {isLoading ? (
          <Skeleton className="h-4 w-28" />
        ) : (
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        )}
        {Icon && !isLoading && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
        )}
        {isLoading && <Skeleton className="h-4 w-4 rounded" />}
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className={cn('text-2xl font-bold tracking-tight', valueClassName)}>
              {value}
            </div>

            {(trend !== undefined || description) && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {TrendIcon && trend !== undefined && (
                  <>
                    <TrendIcon className={cn('h-3.5 w-3.5', trendColor)} aria-hidden />
                    <span className={trendColor}>
                      {trend > 0 ? '+' : ''}{trend}%
                    </span>
                  </>
                )}
                {trendLabel && <span>{trendLabel}</span>}
                {description && !trendLabel && <span>{description}</span>}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface KpiGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function KpiGrid({ children, columns = 4, className }: KpiGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 2 && 'grid-cols-1 sm:grid-cols-2',
        columns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        columns === 4 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
