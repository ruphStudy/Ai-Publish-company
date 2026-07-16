import { type LucideIcon, CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type TimelineItemStatus = 'completed' | 'active' | 'pending' | 'error' | 'warning';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: TimelineItemStatus;
  icon?: LucideIcon;
  metadata?: string;
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
  showConnector?: boolean;
}

const statusConfig: Record<
  TimelineItemStatus,
  { icon: LucideIcon; iconClass: string; dotClass: string }
> = {
  completed: {
    icon: CheckCircle2,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    dotClass: 'bg-emerald-500',
  },
  active: {
    icon: Clock,
    iconClass: 'text-primary',
    dotClass: 'bg-primary',
  },
  pending: {
    icon: Circle,
    iconClass: 'text-muted-foreground',
    dotClass: 'bg-muted-foreground/40 border-2 border-muted-foreground/40 bg-transparent',
  },
  error: {
    icon: XCircle,
    iconClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
  warning: {
    icon: AlertCircle,
    iconClass: 'text-amber-500',
    dotClass: 'bg-amber-500',
  },
};

export function Timeline({ items, className, showConnector = true }: TimelineProps) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status ?? 'pending';
        const config = statusConfig[status];
        const Icon = item.icon ?? config.icon;

        return (
          <li key={item.id} className="relative flex gap-4 pb-6">
            {showConnector && !isLast && (
              <div className="absolute left-[18px] top-7 bottom-0 w-px bg-border" aria-hidden />
            )}

            <div className="relative flex-none">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  status === 'active' && 'bg-primary/10',
                  status === 'completed' && 'bg-emerald-50 dark:bg-emerald-950',
                  status === 'error' && 'bg-destructive/10',
                  status === 'warning' && 'bg-amber-50 dark:bg-amber-950',
                  status === 'pending' && 'bg-muted',
                )}
              >
                <Icon className={cn('h-4 w-4', config.iconClass)} />
              </div>
            </div>

            <div className="min-w-0 flex-1 pt-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium leading-tight text-foreground">{item.title}</p>
                {item.timestamp && (
                  <time
                    className="shrink-0 text-xs text-muted-foreground"
                    dateTime={item.timestamp}
                    title={item.timestamp}
                  >
                    {item.timestamp}
                  </time>
                )}
              </div>
              {item.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
              )}
              {item.metadata && (
                <p className="mt-1 font-mono text-xs text-muted-foreground/70">{item.metadata}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
