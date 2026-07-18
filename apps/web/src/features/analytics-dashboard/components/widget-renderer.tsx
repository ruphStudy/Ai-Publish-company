import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WidgetContainer } from './widget-container';
import { WidgetEmptyState, WidgetErrorState } from './dashboard-states';
import { canViewWidget } from '../lib/permissions';
import type { PermissionContext } from '../lib/permissions';
import type { DashboardDefinition, DashboardFilters, DashboardWidgetDefinition } from '../types';

class WidgetErrorBoundary extends Component<{ children: ReactNode }, { error?: Error }> {
  override state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) { return { error }; }
  override componentDidCatch(_error: Error, _info: ErrorInfo) {}
  override render() {
    if (this.state.error) return <WidgetErrorState error={this.state.error} />;
    return this.props.children;
  }
}

export function WidgetRenderer({ dashboard, widget, filters, permissions, refresh }: { dashboard: DashboardDefinition; widget: DashboardWidgetDefinition; filters: DashboardFilters; permissions?: PermissionContext; refresh: () => void }) {
  if (!canViewWidget(widget, permissions)) return null;
  const context = { dashboard, widget, filters, refresh };
  return (
    <WidgetContainer title={widget.title} description={widget.description} onRefresh={refresh}>
      <WidgetErrorBoundary>
        {widget.render ? widget.render(context) : <WidgetEmptyState title={widget.emptyStateDefinition?.title} description={widget.emptyStateDefinition?.description} />}
      </WidgetErrorBoundary>
    </WidgetContainer>
  );
}
