import { Activity, BarChart3, Brain, Gauge, LineChart, Lightbulb, UserRound } from 'lucide-react';
import type { DashboardDefinition, DashboardKey, DashboardWidgetDefinition } from './types';
import { executiveDashboardDefinition } from '@/features/executive-dashboard/executive-dashboard-definition';
import { userDashboardDefinition } from '@/features/user-dashboard/user-dashboard-definition';
import { salesDashboardDefinition } from '@/features/sales-dashboard/sales-dashboard-definition';
import { revenueDashboardDefinition } from '@/features/revenue-dashboard/revenue-dashboard-definition';
import { analyticsEntityAdapters } from '@/features/entity-analytics-dashboard/entity-registry';
import { createEntityAnalyticsDashboardDefinition } from '@/features/entity-analytics-dashboard/entity-dashboard-definition';
import { aiInsightsDashboardDefinition, opportunityDashboardDefinition } from '@/features/opportunity-ai-dashboards/intelligence-dashboard-definitions';
import { administrationDashboardDefinition, operationsDashboardDefinition } from '@/features/operations-admin-dashboards/operations-admin-definitions';

const foundationWidgets: DashboardWidgetDefinition[] = [
  { key: 'foundation-empty-state', type: 'CUSTOM', title: 'Dashboard foundation', description: 'Business widgets will be connected by dashboard modules.', supportedScopes: ['PORTFOLIO', 'USER', 'PROJECT'], queryDefinition: { queryKeyBase: 'foundation-empty-state', enabled: false }, defaultSize: { columns: 12, rows: 2 }, minimumSize: { columns: 3, rows: 1 }, refreshBehavior: 'INHERIT', exportCapabilities: [], emptyStateDefinition: { title: 'Dashboard ready for widgets', description: 'This reusable shell is prepared for analytics modules.' }, version: 1 },
];

export const dashboardDefinitions: DashboardDefinition[] = [
  { key: 'overview', route: '/analytics/overview', title: 'Analytics Overview', description: 'Unified analytics command center foundation.', icon: Gauge, category: 'OVERVIEW', order: 10, enabled: true, supportedScopes: ['PORTFOLIO', 'USER', 'PROJECT'], defaultScope: 'PORTFOLIO', supportedFilters: ['scope', 'period', 'dateRange', 'comparisonMode', 'currencyCode', 'search'], defaultFilters: { scope: 'PORTFOLIO', period: 'LAST_30_DAYS', comparisonMode: 'PREVIOUS_PERIOD', currencyCode: 'USD' }, supportedPeriods: ['TODAY', 'YESTERDAY', 'LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'CURRENT_MONTH', 'PREVIOUS_MONTH', 'CURRENT_YEAR', 'LIFETIME', 'CUSTOM'], defaultPeriod: 'LAST_30_DAYS', supportedComparisonModes: ['NONE', 'PREVIOUS_PERIOD', 'PREVIOUS_YEAR', 'CUSTOM'], defaultComparisonMode: 'PREVIOUS_PERIOD', supportedCurrencies: ['USD', 'GBP', 'EUR', 'INR'], widgetDefinitions: foundationWidgets, layoutDefinition: { columns: 12, density: 'COMFORTABLE', minWidgetHeight: 160, items: [{ widgetKey: 'foundation-empty-state', colSpan: 12, order: 1 }] }, exportCapabilities: ['CSV'], refreshCapabilities: ['DASHBOARD', 'WIDGET', 'VISIBLE_WIDGETS'], savedViewSupport: true },
  executiveDashboardDefinition,
  userDashboardDefinition,
  salesDashboardDefinition,
  revenueDashboardDefinition,
  ...analyticsEntityAdapters.map(createEntityAnalyticsDashboardDefinition),
  opportunityDashboardDefinition,
  aiInsightsDashboardDefinition,
  operationsDashboardDefinition,
  administrationDashboardDefinition,
];

export class DashboardDefinitionRegistry {
  private readonly definitions = new Map<DashboardKey, DashboardDefinition>();

  constructor(initialDefinitions: DashboardDefinition[] = dashboardDefinitions) {
    initialDefinitions.forEach((definition) => this.register(definition));
  }

  register(definition: DashboardDefinition) {
    this.definitions.set(definition.key, definition);
  }

  all() {
    return [...this.definitions.values()].sort((a, b) => a.order - b.order);
  }

  get(key: DashboardKey | string) {
    return this.definitions.get(key as DashboardKey);
  }

  byCategory() {
    return this.all().reduce<Record<string, DashboardDefinition[]>>((groups, definition) => {
      groups[definition.category] = [...(groups[definition.category] ?? []), definition];
      return groups;
    }, {});
  }
}

export class WidgetRegistry {
  private readonly widgets = new Map<string, DashboardWidgetDefinition>();

  constructor(definitions: DashboardDefinition[] = dashboardDefinitions) {
    definitions.flatMap((dashboard) => dashboard.widgetDefinitions).forEach((widget) => this.register(widget));
  }

  register(widget: DashboardWidgetDefinition) {
    this.widgets.set(widget.key, widget);
  }

  get(key: string) {
    return this.widgets.get(key);
  }
}

export const dashboardRegistry = new DashboardDefinitionRegistry();
export const widgetRegistry = new WidgetRegistry();
