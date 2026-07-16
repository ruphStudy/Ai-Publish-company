import { Sparkles, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AiRecommendationCardProps {
  title: string;
  rationale: string;
  category?: string;
  confidence?: number;
  actionLabel?: string;
  onAction?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  tags?: string[];
  priority?: 'high' | 'medium' | 'low';
  className?: string;
}

const priorityConfig = {
  high: { label: 'High Priority', className: 'border-primary/30 bg-primary/5' },
  medium: { label: 'Medium Priority', className: 'border-amber-200/50 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/30' },
  low: { label: 'Low Priority', className: 'border-border bg-muted/30' },
};

export function AiRecommendationCard({
  title,
  rationale,
  category,
  confidence,
  actionLabel = 'Apply',
  onAction,
  onAccept,
  onReject,
  tags = [],
  priority = 'medium',
  className,
}: AiRecommendationCardProps) {
  const config = priorityConfig[priority];

  return (
    <Card
      className={cn(
        'border-l-4 border-l-primary transition-shadow hover:shadow-md',
        config.className,
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                AI Recommendation
              </p>
              {category && (
                <p className="text-xs text-muted-foreground">{category}</p>
              )}
            </div>
          </div>
          {confidence !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Confidence</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  confidence >= 80 && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
                  confidence >= 60 && confidence < 80 && 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
                  confidence < 60 && 'border-border',
                )}
              >
                {confidence}%
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <h3 className="mb-1.5 text-sm font-semibold leading-tight text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{rationale}</p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {onAccept && (
          <Button variant="ghost" size="sm" onClick={onAccept} className="gap-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950">
            <ThumbsUp className="h-3.5 w-3.5" />
            Helpful
          </Button>
        )}
        {onReject && (
          <Button variant="ghost" size="sm" onClick={onReject} className="gap-1.5 text-muted-foreground">
            <ThumbsDown className="h-3.5 w-3.5" />
            Dismiss
          </Button>
        )}
        {onAction && (
          <Button size="sm" onClick={onAction} className="ml-auto gap-1.5">
            <ExternalLink className="h-3.5 w-3.5" />
            {actionLabel}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
