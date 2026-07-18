import { cva, type VariantProps } from 'class-variance-authority';
import { Sparkles, Brain, CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const aiStatusBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        processing: 'border border-primary/30 bg-primary/10 text-primary',
        completed: 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
        failed: 'border border-destructive/30 bg-destructive/10 text-destructive',
        pending: 'border border-muted bg-muted text-muted-foreground',
        warning: 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
        ai: 'border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary',
      },
    },
    defaultVariants: {
      variant: 'pending',
    },
  },
);

type AiStatusVariant = 'processing' | 'completed' | 'failed' | 'pending' | 'warning' | 'ai';

interface AiStatusBadgeProps extends VariantProps<typeof aiStatusBadgeVariants> {
  label?: string;
  variant?: AiStatusVariant;
  showIcon?: boolean;
  className?: string;
  animate?: boolean;
}

const iconMap: Record<AiStatusVariant, React.ComponentType<{ className?: string }>> = {
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  pending: Clock,
  warning: AlertCircle,
  ai: Sparkles,
};

const defaultLabels: Record<AiStatusVariant, string> = {
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  pending: 'Pending',
  warning: 'Review Needed',
  ai: 'AI Generated',
};

export function AiStatusBadge({
  variant = 'pending',
  label,
  showIcon = true,
  className,
  animate = true,
}: AiStatusBadgeProps) {
  const Icon = iconMap[variant];
  const displayLabel = label ?? defaultLabels[variant];

  return (
    <span
      className={cn(aiStatusBadgeVariants({ variant }), className)}
      role="status"
      aria-label={displayLabel}
    >
      {showIcon && (
        <Icon
          className={cn(
            'h-3 w-3',
            variant === 'processing' && animate && 'animate-spin',
          )}
        />
      )}
      {displayLabel}
    </span>
  );
}

interface AiGeneratedLabelProps {
  model?: string;
  className?: string;
}

export function AiGeneratedLabel({ model, className }: AiGeneratedLabelProps) {
  return (
    <div className={cn('flex items-center gap-1.5 text-xs text-muted-foreground', className)}>
      <div className="flex items-center gap-1 rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5">
        <Brain className="h-3 w-3 text-primary" />
        <span className="text-primary">AI</span>
      </div>
      {model && <span>{model}</span>}
    </div>
  );
}
