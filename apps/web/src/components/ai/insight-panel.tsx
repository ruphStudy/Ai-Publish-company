import { Sparkles, ChevronDown, ChevronUp, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AiStatusBadge } from './ai-status-badge';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  label: string;
  value: string | number;
  context?: string;
  highlight?: boolean;
}

interface InsightPanelProps {
  title?: string;
  summary: string;
  insights?: InsightItem[];
  sources?: string[];
  confidence?: number;
  generatedAt?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  onViewDetails?: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export function InsightPanel({
  title = 'AI Analysis',
  summary,
  insights = [],
  sources = [],
  confidence,
  generatedAt,
  isLoading = false,
  onRefresh,
  onViewDetails,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: InsightPanelProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <Card
      className={cn(
        'border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-secondary/5',
        className,
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              {generatedAt && (
                <p className="text-xs text-muted-foreground">Generated {generatedAt}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading ? (
              <AiStatusBadge variant="processing" />
            ) : (
              <AiStatusBadge variant="ai" />
            )}
            {confidence !== undefined && (
              <Badge variant="outline" className="text-xs">
                {confidence}% confidence
              </Badge>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh insights"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              </Button>
            )}
            {collapsible && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCollapsed((c) => !c)}
                aria-label={collapsed ? 'Expand' : 'Collapse'}
                aria-expanded={!collapsed}
              >
                {collapsed ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4 pt-0">
          {isLoading ? (
            <div className="space-y-2" aria-busy="true" aria-live="polite">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          )}

          {!isLoading && insights.length > 0 && (
            <>
              <Separator />
              <div className="grid gap-2 sm:grid-cols-2">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={cn(
                      'rounded-lg p-3',
                      insight.highlight
                        ? 'bg-primary/10 ring-1 ring-primary/20'
                        : 'bg-muted/50',
                    )}
                  >
                    <p className="text-xs text-muted-foreground">{insight.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">
                      {insight.value}
                    </p>
                    {insight.context && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{insight.context}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {sources.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">Sources:</span>
              {sources.map((source) => (
                <Badge key={source} variant="outline" className="text-xs">
                  {source}
                </Badge>
              ))}
            </div>
          )}

          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="w-full gap-2"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Full Analysis
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
