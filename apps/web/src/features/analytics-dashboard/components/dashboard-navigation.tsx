import { Link, useLocation } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dashboardRegistry } from '../registry';
import { canViewDashboard, type PermissionContext } from '../lib/permissions';
import { formatLabel } from '../lib/formatters';

export function DashboardNavigation({ permissions, compact = false }: { permissions?: PermissionContext; compact?: boolean }) {
  const location = useLocation();
  const groups = dashboardRegistry.byCategory();
  return (
    <nav aria-label="Analytics dashboards" className="space-y-4">
      {Object.entries(groups).map(([category, definitions]) => {
        const visible = definitions.filter((definition) => canViewDashboard(definition, permissions));
        if (!visible.length) return null;
        return (
          <section key={category} aria-labelledby={`analytics-nav-${category}`}>
            {!compact && <h3 id={`analytics-nav-${category}`} className="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{formatLabel(category)}</h3>}
            <div className="space-y-1">
              {visible.map((definition) => {
                const Icon = definition.icon;
                const active = location.pathname === definition.route;
                return (
                  <Button key={definition.key} variant={active ? 'secondary' : 'ghost'} className={cn('w-full justify-start gap-2', compact && 'justify-center px-2')} asChild disabled={!definition.enabled}>
                    <Link to={{ pathname: definition.route, search: location.search }}>
                      {Icon && <Icon className="h-4 w-4" />}
                      {!compact && <span>{definition.title}</span>}
                      {!definition.enabled && !compact && <Badge variant="outline">Soon</Badge>}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </section>
        );
      })}
    </nav>
  );
}
