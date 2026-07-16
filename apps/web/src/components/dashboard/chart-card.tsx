import { type LucideIcon, MoreHorizontal, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/empty-state';
import { cn } from '@/lib/utils';

interface ChartMenuItem {
  label: string;
  onClick: () => void;
}

interface ChartCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRefresh?: () => void;
  menuItems?: ChartMenuItem[];
  headerAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  height?: number;
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  children,
  isLoading = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  onRefresh,
  menuItems = [],
  headerAction,
  className,
  contentClassName,
  height = 300,
}: ChartCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <div>
              <CardTitle className="text-sm font-semibold">{title}</CardTitle>
              {description && (
                <CardDescription className="text-xs">{description}</CardDescription>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {headerAction}
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                disabled={isLoading}
                aria-label="Refresh chart"
              >
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            )}
            {menuItems.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Chart options">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {menuItems.map((item) => (
                    <DropdownMenuItem key={item.label} onClick={item.onClick}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn('pt-0', contentClassName)}>
        {isLoading ? (
          <div style={{ height }} className="flex flex-col justify-end gap-2 pb-4">
            <div className="flex h-full items-end gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="flex-1 rounded-t"
                  style={{ height: `${30 + Math.random() * 60}%` }}
                />
              ))}
            </div>
          </div>
        ) : isEmpty ? (
          <div style={{ height }} className="flex items-center justify-center">
            <EmptyState
              preset="data"
              title={emptyTitle}
              description={emptyDescription}
              size="sm"
            />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
