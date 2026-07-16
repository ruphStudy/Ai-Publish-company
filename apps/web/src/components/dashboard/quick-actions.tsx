import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  disabled?: boolean;
  badge?: string;
  primary?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  isLoading?: boolean;
  title?: string;
  layout?: 'row' | 'grid' | 'list';
  className?: string;
  showCard?: boolean;
}

function QuickActionItem({ action, layout }: { action: QuickAction; layout: string }) {
  if (layout === 'list') {
    return (
      <button
        type="button"
        onClick={action.onClick}
        disabled={action.disabled}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
      >
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
            action.primary ? 'bg-primary/10' : 'bg-muted',
          )}
        >
          <action.icon className={cn('h-4 w-4', action.primary ? 'text-primary' : 'text-muted-foreground')} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{action.label}</p>
          {action.description && (
            <p className="truncate text-xs text-muted-foreground">{action.description}</p>
          )}
        </div>
        {action.badge && (
          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {action.badge}
          </span>
        )}
      </button>
    );
  }

  return (
    <Button
      variant={action.variant ?? (action.primary ? 'default' : 'outline')}
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        'gap-2',
        layout === 'grid' && 'h-auto flex-col py-4',
      )}
    >
      <action.icon className={cn(layout === 'grid' ? 'h-5 w-5' : 'h-4 w-4')} />
      <span className={cn(layout === 'grid' && 'text-xs')}>{action.label}</span>
      {action.badge && (
        <span className="ml-1 rounded-full bg-background/20 px-1.5 py-0.5 text-xs">
          {action.badge}
        </span>
      )}
    </Button>
  );
}

export function QuickActions({
  actions,
  isLoading = false,
  title,
  layout = 'row',
  className,
  showCard = false,
}: QuickActionsProps) {
  const content = isLoading ? (
    <div className={cn(
      'flex gap-2',
      layout === 'grid' && 'grid grid-cols-2 sm:grid-cols-4',
      layout === 'list' && 'flex-col',
    )}>
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            layout === 'grid' ? 'h-20 w-full' : layout === 'list' ? 'h-12 w-full' : 'h-10 w-28',
          )}
        />
      ))}
    </div>
  ) : (
    <div
      className={cn(
        layout === 'row' && 'flex flex-wrap gap-2',
        layout === 'grid' && 'grid grid-cols-2 gap-2 sm:grid-cols-4',
        layout === 'list' && 'flex flex-col gap-1',
      )}
      role="toolbar"
      aria-label="Quick actions"
    >
      {actions.map((action) => (
        <QuickActionItem key={action.id} action={action} layout={layout} />
      ))}
    </div>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={className}>
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title && 'pt-6')}>{content}</CardContent>
    </Card>
  );
}
