import type { AdministrationDashboardResponse, OperationsDashboardResponse } from '../types';

export function operationsDashboardUnavailableResponse(): OperationsDashboardResponse {
  return {
    systemOverview: [],
    publishingQueue: [],
    importQueue: [],
    synchronizationQueue: [],
    analyticsQueue: [],
    opportunityQueue: [],
    aiInsightQueue: [],
    backgroundJobs: [],
    failedJobs: [],
    retryQueue: [],
    activeWorkers: [],
    providerStatus: [],
    marketplaceStatus: [],
    apiHealth: [],
    storageStatus: [],
    processingStatistics: [],
    errorSummary: [],
    operationalAlerts: [],
    recentOperations: [],
    dataFreshness: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Operations dashboard aggregates are not available from the current backend contract.' } },
  };
}

export function administrationDashboardUnavailableResponse(): AdministrationDashboardResponse {
  return {
    userSummary: [],
    rolesPermissionsSummary: [],
    workspaceSummary: [],
    apiKeyStatus: [],
    providerConnections: [],
    marketplaceConnections: [],
    configurationStatus: [],
    featureFlags: [],
    auditSummary: [],
    securityEvents: [],
    loginActivity: [],
    systemNotifications: [],
    scheduledJobs: [],
    backupStatus: [],
    maintenanceStatus: [],
    applicationVersion: [],
    environmentInformation: [],
    metadata: { completeness: { status: 'UNKNOWN', message: 'Administration dashboard aggregates are not available from the current backend contract.' } },
  };
}
