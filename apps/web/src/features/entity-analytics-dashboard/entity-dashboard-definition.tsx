import { BarChart3 } from 'lucide-react';
import type { DashboardDefinition, DashboardWidgetDefinition } from '@/features/analytics-dashboard/types';
import { platformDefaults } from '@/features/platform-registry';
import type { AnalyticsEntityAdapter } from './types';
import { AnalyticsActivity, AnalyticsBreakdown, AnalyticsComparison, AnalyticsCoverage, AnalyticsEntityHeader, AnalyticsFreshness, AnalyticsOverview, AnalyticsRanking, AnalyticsTrend, RelatedAIInsights, RelatedOpportunities } from './components/entity-analytics-sections';

export function createEntityAnalyticsWidgets(adapter: AnalyticsEntityAdapter): DashboardWidgetDefinition[] {
  return [
    { key: `${adapter.entityKey}_HEADER`, type: 'CUSTOM', title: 'Entity Header', category: 'OVERVIEW', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-header` }, defaultSize: { columns: 12, rows: 1 }, minimumSize: { columns: 6, rows: 1 }, refreshBehavior: 'INHERIT', exportCapabilities: [], version: 1, render: ({ filters }) => <AnalyticsEntityHeader adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_OVERVIEW`, type: 'KPI', title: 'KPI Overview', category: 'PERFORMANCE', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-overview` }, defaultSize: { columns: 12, rows: 2 }, minimumSize: { columns: 6, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsOverview adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_TREND`, type: 'TREND_CHART', title: 'Performance Trend', category: 'PERFORMANCE', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-trend` }, defaultSize: { columns: 12, rows: 3 }, minimumSize: { columns: 6, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV', 'PNG'], version: 1, render: ({ filters }) => <AnalyticsTrend adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_BREAKDOWN`, type: 'BREAKDOWN', title: 'Contribution and Distribution', category: 'DISTRIBUTION', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-breakdown` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsBreakdown adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_RANKING`, type: 'RANKING', title: 'Rankings', category: 'PERFORMANCE', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-ranking` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsRanking adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_COVERAGE`, type: 'HEALTH', title: 'Coverage', category: 'DISTRIBUTION', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-coverage` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsCoverage adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_COMPARISON`, type: 'COMPARISON', title: 'Comparison', category: 'PERFORMANCE', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-comparison` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsComparison adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_OPPORTUNITIES`, type: 'OPPORTUNITY', title: 'Related Opportunities', category: 'OPPORTUNITIES', requiredPermissions: ['opportunities:read'], supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-opportunities` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'MANUAL', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <RelatedOpportunities adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_AI_INSIGHTS`, type: 'INSIGHT', title: 'Related AI Insights', category: 'AI_INSIGHTS', requiredPermissions: ['ai-insights:read'], supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-insights` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'MANUAL', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <RelatedAIInsights adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_ACTIVITY`, type: 'ACTIVITY', title: 'Recent Activity', category: 'OPERATIONS', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-activity` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsActivity adapter={adapter} filters={filters} /> },
    { key: `${adapter.entityKey}_FRESHNESS`, type: 'HEALTH', title: 'Freshness', category: 'OPERATIONS', requiredPermissions: adapter.requiredPermissions, supportedDashboards: [adapter.dashboardKey], supportedScopes: adapter.supportedScopes, queryDefinition: { queryKeyBase: `${adapter.dashboardKey}-freshness` }, defaultSize: { columns: 6, rows: 3 }, minimumSize: { columns: 4, rows: 2 }, refreshBehavior: 'INHERIT', exportCapabilities: ['CSV'], version: 1, render: ({ filters }) => <AnalyticsFreshness adapter={adapter} filters={filters} /> },
  ];
}

export function createEntityAnalyticsDashboardDefinition(adapter: AnalyticsEntityAdapter): DashboardDefinition {
  const widgets = createEntityAnalyticsWidgets(adapter);
  return {
    key: adapter.dashboardKey,
    route: adapter.route,
    title: adapter.title,
    description: adapter.description,
    icon: BarChart3,
    category: 'PERFORMANCE',
    order: 70 + ['BOOK_ANALYTICS', 'EDITION_ANALYTICS', 'AUTHOR_ANALYTICS', 'SERIES_ANALYTICS', 'PROVIDER_ANALYTICS', 'MARKETPLACE_ANALYTICS', 'GEOGRAPHIC_ANALYTICS', 'FORMAT_ANALYTICS'].indexOf(adapter.entityKey),
    enabled: true,
    featureFlag: `${adapter.dashboardKey}`,
    requiredPermissions: adapter.requiredPermissions ?? ['analytics:read'],
    supportedScopes: adapter.supportedScopes,
    defaultScope: adapter.defaultScope,
    supportedFilters: adapter.filters,
    defaultFilters: { scope: adapter.defaultScope, period: 'LAST_30_DAYS', comparisonMode: 'PREVIOUS_PERIOD', currencyCode: platformDefaults.reportingCurrency },
    supportedPeriods: ['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'CURRENT_MONTH', 'PREVIOUS_MONTH', 'CURRENT_QUARTER', 'CURRENT_YEAR', 'CUSTOM'],
    defaultPeriod: 'LAST_30_DAYS',
    supportedComparisonModes: ['NONE', 'PREVIOUS_PERIOD', 'PREVIOUS_CALENDAR_PERIOD', 'PREVIOUS_YEAR', 'CUSTOM'],
    defaultComparisonMode: 'PREVIOUS_PERIOD',
    supportedCurrencies: platformDefaults.supportedCurrencies,
    widgetDefinitions: widgets,
    layoutDefinition: {
      columns: 12,
      density: 'COMFORTABLE',
      minWidgetHeight: 180,
      items: [
        { widgetKey: `${adapter.entityKey}_HEADER`, colSpan: 12, order: 1 },
        { widgetKey: `${adapter.entityKey}_OVERVIEW`, colSpan: 12, order: 2 },
        { widgetKey: `${adapter.entityKey}_TREND`, colSpan: 12, order: 3 },
        { widgetKey: `${adapter.entityKey}_BREAKDOWN`, colSpan: 6, order: 4 },
        { widgetKey: `${adapter.entityKey}_RANKING`, colSpan: 6, order: 5 },
        { widgetKey: `${adapter.entityKey}_COVERAGE`, colSpan: 6, order: 6 },
        { widgetKey: `${adapter.entityKey}_COMPARISON`, colSpan: 6, order: 7 },
        { widgetKey: `${adapter.entityKey}_OPPORTUNITIES`, colSpan: 6, order: 8 },
        { widgetKey: `${adapter.entityKey}_AI_INSIGHTS`, colSpan: 6, order: 9 },
        { widgetKey: `${adapter.entityKey}_ACTIVITY`, colSpan: 6, order: 10 },
        { widgetKey: `${adapter.entityKey}_FRESHNESS`, colSpan: 6, order: 11 },
      ],
    },
    exportCapabilities: ['CSV', 'XLSX'],
    refreshCapabilities: ['DASHBOARD', 'WIDGET', 'VISIBLE_WIDGETS', 'BACKGROUND'],
    savedViewSupport: true,
    metadata: { entityKey: adapter.entityKey, drillDownTargets: adapter.drillDownTargets },
  };
}
