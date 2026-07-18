import { cn } from '@/lib/utils';
import { WidgetRenderer } from './widget-renderer';
import type { PermissionContext } from '../lib/permissions';
import type { DashboardDefinition, DashboardFilters } from '../types';

export function DashboardGrid({ children, columns = 12 }: { children: React.ReactNode; columns?: number }) {
  return <div className={cn('grid gap-4', columns === 12 ? 'grid-cols-1 md:grid-cols-6 xl:grid-cols-12' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4')}>{children}</div>;
}

export function DashboardSection({ title, description, children }: { title?: string; description?: string; children: React.ReactNode }) {
  return <section className="space-y-3">{title && <div><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="text-sm text-muted-foreground">{description}</p>}</div>}{children}</section>;
}

export function DashboardPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-lg border bg-background p-4', className)}>{children}</div>;
}

export const DashboardCard = DashboardPanel;

export function DashboardContent({ definition, filters, permissions, refresh }: { definition: DashboardDefinition; filters: DashboardFilters; permissions?: PermissionContext; refresh: () => void }) {
  return (
    <DashboardGrid columns={definition.layoutDefinition.columns}>
      {definition.layoutDefinition.items.filter((item) => !item.hidden).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((item) => {
        const widget = definition.widgetDefinitions.find((candidate) => candidate.key === item.widgetKey);
        if (!widget) return null;
        const colSpan = item.colSpan ?? 12;
        return (
          <div key={item.widgetKey} className={cn('min-w-0', colSpan === 12 && 'md:col-span-6 xl:col-span-12', colSpan === 6 && 'md:col-span-3 xl:col-span-6', colSpan === 4 && 'md:col-span-2 xl:col-span-4', colSpan === 3 && 'md:col-span-2 xl:col-span-3', colSpan === 2 && 'md:col-span-1 xl:col-span-2', colSpan === 1 && 'xl:col-span-1')} style={{ minHeight: item.minHeight ?? definition.layoutDefinition.minWidgetHeight }}>
            <WidgetRenderer dashboard={definition} widget={widget} filters={filters} permissions={permissions} refresh={refresh} />
          </div>
        );
      })}
    </DashboardGrid>
  );
}
