import { BarChart3, BookOpen, Factory, LayoutDashboard, Send, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface AppRouteMeta {
  key: string;
  label: string;
  path: string;
  icon?: LucideIcon;
  permissions?: string[];
  launchVisible: boolean;
  children?: AppRouteMeta[];
}

export const appRoutes: AppRouteMeta[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, launchVisible: true },
  { key: 'projects', label: 'Books & Projects', path: '/projects', icon: BookOpen, permissions: ['books:read'], launchVisible: true },
  { key: 'categories', label: 'Categories', path: '/categories', icon: BookOpen, permissions: ['categories:read'], launchVisible: true },
  { key: 'analytics', label: 'Analytics', path: '/analytics/overview', icon: BarChart3, permissions: ['analytics:read'], launchVisible: true, children: [
    { key: 'analytics-overview', label: 'Overview', path: '/analytics/overview', permissions: ['analytics:read'], launchVisible: true },
    { key: 'analytics-sales', label: 'Sales', path: '/analytics/sales', permissions: ['analytics:read'], launchVisible: true },
    { key: 'analytics-revenue', label: 'Revenue', path: '/analytics/revenue', permissions: ['analytics:financial:read'], launchVisible: true },
    { key: 'analytics-opportunities', label: 'Opportunities', path: '/analytics/opportunities', permissions: ['opportunities:read'], launchVisible: true },
    { key: 'analytics-ai-insights', label: 'AI Insights', path: '/analytics/ai-insights', permissions: ['ai-insights:read'], launchVisible: true },
  ] },
  { key: 'operations', label: 'Operations', path: '/operations/jobs', icon: Factory, permissions: ['jobs:read'], launchVisible: true, children: [
    { key: 'operations-jobs', label: 'Background Jobs', path: '/operations/jobs', permissions: ['jobs:read'], launchVisible: true },
    { key: 'operations-resilience', label: 'Resilience', path: '/operations/resilience', permissions: ['recovery:read'], launchVisible: true },
  ] },
  { key: 'publishing-status', label: 'Publishing Status', path: '/analytics/operations', icon: Send, permissions: ['publishing:read'], launchVisible: true },
  { key: 'settings', label: 'Settings', path: '/settings', icon: Settings, permissions: ['settings:read'], launchVisible: true },
];

export const launchQuickActions = [
  { id: 'create-project', label: 'Create Project', description: 'Start a book publishing project.', path: '/projects', permission: 'books:create' },
  { id: 'create-category', label: 'Add Category', description: 'Create publishing taxonomy.', path: '/categories', permission: 'categories:write' },
  { id: 'view-analytics', label: 'View Analytics', description: 'Open analytics dashboards.', path: '/analytics/overview', permission: 'analytics:read' },
  { id: 'view-jobs', label: 'Background Jobs', description: 'Review queue status and executions.', path: '/operations/jobs', permission: 'jobs:read' },
  { id: 'view-insights', label: 'AI Insights', description: 'Review generated recommendations.', path: '/analytics/ai-insights', permission: 'ai-insights:read' },
];

export function routeForDashboardKey(key: string) {
  const map: Record<string, string> = {
    'sales-dashboard': '/analytics/sales',
    'revenue-dashboard': '/analytics/revenue',
    'opportunity-dashboard': '/analytics/opportunities',
    'ai-insights-dashboard': '/analytics/ai-insights',
    'book-analytics-dashboard': '/analytics/books',
    'edition-analytics-dashboard': '/analytics/editions',
    'author-analytics-dashboard': '/analytics/authors',
    'series-analytics-dashboard': '/analytics/series',
    'provider-analytics-dashboard': '/analytics/providers',
    'marketplace-analytics-dashboard': '/analytics/marketplaces',
    'geographic-analytics-dashboard': '/analytics/geography',
    'format-analytics-dashboard': '/analytics/formats',
  };
  return map[key] ?? key;
}
