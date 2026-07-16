import { TrendingUp, TrendingDown, Minus, BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface OpportunityScoreCardProps {
  title: string;
  category: string;
  subcategory?: string;
  score: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  competitionLevel?: 'low' | 'medium' | 'high';
  demandLevel?: 'low' | 'medium' | 'high';
  estimatedRevenue?: string;
  keywords?: string[];
  onOpen?: () => void;
  onAddToQueue?: () => void;
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'text-blue-600 dark:text-blue-400';
  return 'text-muted-foreground';
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-500';
  if (score >= 40) return 'bg-blue-500';
  return 'bg-muted-foreground';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Weak';
}

const levelColors = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  medium: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  high: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
};

export function OpportunityScoreCard({
  title,
  category,
  subcategory,
  score,
  trend,
  trendValue,
  competitionLevel,
  demandLevel,
  estimatedRevenue,
  keywords = [],
  onOpen,
  onAddToQueue,
  className,
}: OpportunityScoreCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendClass =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-destructive'
        : 'text-muted-foreground';

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-primary/20',
        className,
      )}
      onClick={onOpen}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium">{category}</span>
              {subcategory && (
                <>
                  <span>·</span>
                  <span>{subcategory}</span>
                </>
              )}
            </div>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {title}
            </h3>
          </div>

          <div className="flex shrink-0 flex-col items-center">
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold',
                getScoreRingColor(score),
                'bg-opacity-10',
              )}
              style={{
                background: `conic-gradient(currentColor ${score}%, transparent 0)`,
              }}
              title={`Opportunity score: ${score}/100`}
            >
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full bg-background text-sm font-bold',
                  getScoreColor(score),
                )}
              >
                {score}
              </div>
            </div>
            <p className={cn('mt-0.5 text-xs font-medium', getScoreColor(score))}>
              {getScoreLabel(score)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Opportunity Score</span>
            <span className="font-medium">{score}/100</span>
          </div>
          <Progress
            value={score}
            className="h-1.5"
            indicatorClassName={cn(
              score >= 80 && 'bg-emerald-500',
              score >= 60 && score < 80 && 'bg-amber-500',
              score >= 40 && score < 60 && 'bg-blue-500',
              score < 40 && 'bg-muted-foreground',
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {competitionLevel && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Competition</p>
              <Badge variant="outline" className={cn('text-xs', levelColors[competitionLevel])}>
                {competitionLevel.charAt(0).toUpperCase() + competitionLevel.slice(1)}
              </Badge>
            </div>
          )}
          {demandLevel && (
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Demand</p>
              <Badge variant="outline" className={cn('text-xs', levelColors[demandLevel])}>
                {demandLevel.charAt(0).toUpperCase() + demandLevel.slice(1)}
              </Badge>
            </div>
          )}
        </div>

        {(trend || estimatedRevenue) && (
          <div className="flex items-center justify-between text-xs">
            {trend && trendValue && (
              <div className={cn('flex items-center gap-1', trendClass)}>
                <TrendIcon className="h-3.5 w-3.5" />
                <span>{trendValue}</span>
              </div>
            )}
            {estimatedRevenue && (
              <span className="font-medium text-foreground">{estimatedRevenue}</span>
            )}
          </div>
        )}

        {keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {keywords.slice(0, 4).map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs">
                {kw}
              </Badge>
            ))}
            {keywords.length > 4 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{keywords.length - 4}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0" onClick={(e) => e.stopPropagation()}>
        <Button variant="outline" size="sm" onClick={onOpen} className="flex-1 gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          Details
        </Button>
        {onAddToQueue && (
          <Button size="sm" onClick={onAddToQueue} className="flex-1 gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            Add to Queue
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
