import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatTrendLabel } from '../lib/formatters';
import type { KPIValue } from '../types';

export function DashboardKPI({ value, loading, error, compact = false, onDrillDown }: { value: KPIValue; loading?: boolean; error?: boolean; compact?: boolean; onDrillDown?: () => void }) {
  const TrendIcon = value.trend?.direction === 'UP' ? TrendingUp : value.trend?.direction === 'DOWN' ? TrendingDown : Minus;
  return (
    <Card className={cn(onDrillDown && 'cursor-pointer hover:shadow-md')} onClick={onDrillDown}>
      <CardContent className={cn('p-4', compact && 'p-3')}>
        {loading ? (
          <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-24" /></div>
        ) : error ? (
          <p className="text-sm text-destructive">Unavailable</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground">{value.label}</p>
            <p className={cn('font-bold tracking-tight', compact ? 'text-xl' : 'text-2xl')}>{value.value ?? '—'}</p>
            {(value.secondaryValue !== undefined || value.trend) && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {value.trend && <TrendIcon className="h-3.5 w-3.5" aria-hidden />}
                {value.trend && <span>{formatTrendLabel(value.trend)}</span>}
                {value.secondaryValue !== undefined && <span>{value.secondaryValue}</span>}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
