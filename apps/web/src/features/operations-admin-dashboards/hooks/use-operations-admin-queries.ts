import type { DashboardFilters } from '@/features/analytics-dashboard/types';
import { useAnalyticsQuery } from '@/features/analytics-dashboard/hooks/use-analytics-query';
import type { AdministrationDashboardResponse, OperationsDashboardResponse } from '../types';

function useOperationsSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'operations-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId ?? filters.providerKeys?.[0] ?? filters.marketplaceIds?.[0], filters }, endpoint, enabled);
}

function useAdministrationSection<T>(widgetKey: string, filters: DashboardFilters, endpoint?: string, enabled = true) {
  return useAnalyticsQuery<T>({ dashboardKey: 'administration-dashboard', widgetKey, scope: filters.scope ?? 'PORTFOLIO', entityId: filters.projectId ?? filters.portfolioId, filters }, endpoint, enabled);
}

export function useOperationsDashboard(filters: DashboardFilters) {
  const query = useOperationsSection<OperationsDashboardResponse>('operations-dashboard', filters, '/dashboard/analytics/operations');
  return { ...query, data: query.data ?? { systemOverview: [], publishingQueue: [], importQueue: [], synchronizationQueue: [], analyticsQueue: [], opportunityQueue: [], aiInsightQueue: [], backgroundJobs: [], failedJobs: [], retryQueue: [], activeWorkers: [], providerStatus: [], marketplaceStatus: [], apiHealth: [], storageStatus: [], processingStatistics: [], errorSummary: [], operationalAlerts: [], recentOperations: [], dataFreshness: [] } };
}

export function useAdministrationDashboard(filters: DashboardFilters) {
  const query = useAdministrationSection<AdministrationDashboardResponse>('administration-dashboard', filters, '/dashboard/analytics/administration');
  return { ...query, data: query.data ?? { userSummary: [], rolesPermissionsSummary: [], workspaceSummary: [], apiKeyStatus: [], providerConnections: [], marketplaceConnections: [], configurationStatus: [], featureFlags: [], auditSummary: [], securityEvents: [], loginActivity: [], systemNotifications: [], scheduledJobs: [], backupStatus: [], maintenanceStatus: [], applicationVersion: [], environmentInformation: [] } };
}
