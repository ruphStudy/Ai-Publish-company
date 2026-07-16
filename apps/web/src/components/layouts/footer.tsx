import { Sparkles, Github, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className={cn('border-t bg-background', className)}>
      <div className="flex h-12 items-center justify-between px-6">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10">
            <Sparkles className="h-3 w-3 text-primary" />
          </div>
          <span>AI Publisher © {year}</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>v1.0.0</span>
          <Separator orientation="vertical" className="h-3" />
          <a
            href="#"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
            Docs
          </a>
          <a
            href="#"
            className="flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Github className="h-3 w-3" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
