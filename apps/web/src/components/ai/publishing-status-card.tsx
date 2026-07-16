import {
  Send, Clock, CheckCircle2, XCircle, AlertCircle,
  BookOpen, Eye, MoreHorizontal, ExternalLink,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type PublishingStatus =
  | 'draft'
  | 'generating'
  | 'review'
  | 'approved'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'paused';

interface PublishingStatusCardProps {
  title: string;
  subtitle?: string;
  status: PublishingStatus;
  progress?: number;
  platform?: string;
  scheduledAt?: string;
  publishedAt?: string;
  errorMessage?: string;
  asin?: string;
  onView?: () => void;
  onPublish?: () => void;
  onPause?: () => void;
  onRetry?: () => void;
  onDelete?: () => void;
  className?: string;
}

const statusConfig: Record<
  PublishingStatus,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badgeClass: string;
    showProgress: boolean;
  }
> = {
  draft: {
    label: 'Draft',
    icon: BookOpen,
    badgeClass: 'border-border bg-muted text-muted-foreground',
    showProgress: false,
  },
  generating: {
    label: 'Generating',
    icon: Clock,
    badgeClass: 'border-primary/30 bg-primary/10 text-primary',
    showProgress: true,
  },
  review: {
    label: 'In Review',
    icon: Eye,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    showProgress: false,
  },
  approved: {
    label: 'Approved',
    icon: CheckCircle2,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    showProgress: false,
  },
  publishing: {
    label: 'Publishing',
    icon: Send,
    badgeClass: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    showProgress: true,
  },
  published: {
    label: 'Published',
    icon: CheckCircle2,
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    showProgress: false,
  },
  failed: {
    label: 'Failed',
    icon: XCircle,
    badgeClass: 'border-destructive/30 bg-destructive/10 text-destructive',
    showProgress: false,
  },
  paused: {
    label: 'Paused',
    icon: AlertCircle,
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    showProgress: false,
  },
};

export function PublishingStatusCard({
  title,
  subtitle,
  status,
  progress,
  platform,
  scheduledAt,
  publishedAt,
  errorMessage,
  asin,
  onView,
  onPublish,
  onPause,
  onRetry,
  onDelete,
  className,
}: PublishingStatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Card className={cn('transition-shadow hover:shadow-sm', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={cn('flex items-center gap-1 text-xs', config.badgeClass)}
            >
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  aria-label="More options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onView && <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>}
                {onPublish && status === 'approved' && (
                  <DropdownMenuItem onClick={onPublish}>Publish Now</DropdownMenuItem>
                )}
                {onPause && (status === 'generating' || status === 'publishing') && (
                  <DropdownMenuItem onClick={onPause}>Pause</DropdownMenuItem>
                )}
                {onRetry && status === 'failed' && (
                  <DropdownMenuItem onClick={onRetry}>Retry</DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-2 pb-3">
        {config.showProgress && progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {errorMessage && status === 'failed' && (
          <p className="rounded-md bg-destructive/10 p-2 text-xs text-destructive">
            {errorMessage}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          {platform && (
            <div>
              <span className="font-medium text-foreground">Platform</span>
              <p>{platform}</p>
            </div>
          )}
          {asin && (
            <div>
              <span className="font-medium text-foreground">ASIN</span>
              <p className="font-mono">{asin}</p>
            </div>
          )}
          {scheduledAt && (
            <div>
              <span className="font-medium text-foreground">Scheduled</span>
              <p>{scheduledAt}</p>
            </div>
          )}
          {publishedAt && (
            <div>
              <span className="font-medium text-foreground">Published</span>
              <p>{publishedAt}</p>
            </div>
          )}
        </div>
      </CardContent>

      {onView && (
        <CardFooter className="pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            className="h-8 w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
