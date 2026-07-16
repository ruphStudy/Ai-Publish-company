import { type LucideIcon, SearchX, BarChart2, FileText, Inbox, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EmptyStatePreset = 'search' | 'data' | 'documents' | 'inbox' | 'error' | 'custom';

interface EmptyStateProps {
  preset?: EmptyStatePreset;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const presets: Record<
  Exclude<EmptyStatePreset, 'custom'>,
  { icon: LucideIcon; title: string; description: string }
> = {
  search: {
    icon: SearchX,
    title: 'No results found',
    description: 'Try adjusting your search or filter to find what you are looking for.',
  },
  data: {
    icon: BarChart2,
    title: 'No data available',
    description: 'Data will appear here once it has been collected.',
  },
  documents: {
    icon: FileText,
    title: 'No documents yet',
    description: 'Create your first document to get started.',
  },
  inbox: {
    icon: Inbox,
    title: 'All caught up',
    description: 'You have no new notifications or items to review.',
  },
  error: {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
  },
};

const sizeClasses = {
  sm: { wrapper: 'py-8', icon: 'h-8 w-8', title: 'text-sm', description: 'text-xs' },
  md: { wrapper: 'py-12', icon: 'h-10 w-10', title: 'text-base', description: 'text-sm' },
  lg: { wrapper: 'py-16', icon: 'h-12 w-12', title: 'text-lg', description: 'text-sm' },
};

export function EmptyState({
  preset = 'data',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const presetData = preset !== 'custom' ? presets[preset] : null;
  const Icon = icon ?? presetData?.icon ?? BarChart2;
  const resolvedTitle = title ?? presetData?.title ?? 'No data';
  const resolvedDescription = description ?? presetData?.description;

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.wrapper,
        className,
      )}
      role="status"
      aria-label={resolvedTitle}
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Icon className={cn(sizes.icon, 'text-muted-foreground/60')} strokeWidth={1.5} />
      </div>

      <h3 className={cn('mb-1 font-semibold text-foreground', sizes.title)}>{resolvedTitle}</h3>

      {resolvedDescription && (
        <p className={cn('mb-6 max-w-xs text-muted-foreground', sizes.description)}>
          {resolvedDescription}
        </p>
      )}

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3">
          {secondaryActionLabel && onSecondaryAction && (
            <Button variant="outline" size="sm" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
