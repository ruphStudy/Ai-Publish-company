import { type LucideIcon, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { cn } from '@/lib/utils';

type ActivityType = 'create' | 'update' | 'delete' | 'publish' | 'generate' | 'scan' | 'error' | 'info';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  relativeTime: string;
  user?: string;
  icon?: LucideIcon;
  badge?: string;
}

interface RecentActivityProps {
  items: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  title?: string;
  className?: string;
}

const typeConfig: Record<
  ActivityType,
  { dotClass: string; iconClass: string; label: string }
> = {
  create: { dotClass: 'bg-primary', iconClass: 'text-primary', label: 'Created' },
  update: { dotClass: 'bg-blue-500', iconClass: 'text-blue-500', label: 'Updated' },
  delete: { dotClass: 'bg-destructive', iconClass: 'text-destructive', label: 'Deleted' },
  publish: { dotClass: 'bg-emerald-500', iconClass: 'text-emerald-500', label: 'Published' },
  generate: { dotClass: 'bg-primary', iconClass: 'text-primary', label: 'Generated' },
  scan: { dotClass: 'bg-blue-500', iconClass: 'text-blue-500', label: 'Scanned' },
  error: { dotClass: 'bg-destructive', iconClass: 'text-destructive', label: 'Error' },
  info: { dotClass: 'bg-muted-foreground', iconClass: 'text-muted-foreground', label: 'Info' },
};

export function RecentActivity({
  items,
  isLoading = false,
  maxItems = 8,
  onViewAll,
  title = 'Recent Activity',
  className,
}: RecentActivityProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="mt-0.5 h-2 w-2 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        ) : displayItems.length === 0 ? (
          <EmptyState preset="inbox" size="sm" />
        ) : (
          <ol className="space-y-3" aria-label="Activity feed">
            {displayItems.map((item, index) => {
              const config = typeConfig[item.type];
              const Icon = item.icon;
              const isLast = index === displayItems.length - 1;

              return (
                <li key={item.id} className="relative flex items-start gap-3">
                  {!isLast && (
                    <div
                      className="absolute left-[3.5px] top-4 bottom-0 w-px bg-border"
                      aria-hidden
                    />
                  )}

                  <div
                    className={cn(
                      'relative mt-1.5 h-2 w-2 shrink-0 rounded-full',
                      config.dotClass,
                    )}
                    aria-hidden
                  />

                  <div className="min-w-0 flex-1 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                        {(item.user || item.badge) && (
                          <div className="mt-1 flex items-center gap-2">
                            {item.user && (
                              <span className="text-xs text-muted-foreground">{item.user}</span>
                            )}
                            {item.badge && (
                              <Badge variant="outline" className="text-xs py-0">
                                {item.badge}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <time
                        className="shrink-0 text-xs text-muted-foreground"
                        dateTime={item.timestamp}
                        title={item.timestamp}
                      >
                        {item.relativeTime}
                      </time>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>

      {onViewAll && items.length > 0 && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="h-8 w-full gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            View All Activity
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
