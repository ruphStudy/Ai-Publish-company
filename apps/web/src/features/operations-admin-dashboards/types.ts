import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export type OperationalSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OperationalStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'PENDING' | 'RUNNING' | 'FAILED' | 'RETRYING' | 'PAUSED' | 'UNKNOWN';

export interface OperationsDashboardMetadata {
  generatedAt?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface OperationalQueueItem {
  id: string;
  title: string;
  type?: string;
  status?: OperationalStatus | string;
  severity?: OperationalSeverity;
  count?: number | null;
  progress?: number | null;
  updatedAt?: string;
  path?: string;
}

export interface OperationalStatusItem {
  id: string;
  label: string;
  status: OperationalStatus | string;
  message?: string;
  updatedAt?: string;
  path?: string;
}

export interface OperationalActivityItem {
  id: string;
  title: string;
  type?: string;
  status?: OperationalStatus | string;
  severity?: OperationalSeverity;
  timestamp?: string;
  path?: string;
}

export interface OperationalFreshnessItem {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface OperationsDashboardResponse {
  systemOverview?: KPIValue[];
  publishingQueue?: OperationalQueueItem[];
  importQueue?: OperationalQueueItem[];
  synchronizationQueue?: OperationalQueueItem[];
  analyticsQueue?: OperationalQueueItem[];
  opportunityQueue?: OperationalQueueItem[];
  aiInsightQueue?: OperationalQueueItem[];
  backgroundJobs?: OperationalQueueItem[];
  failedJobs?: OperationalQueueItem[];
  retryQueue?: OperationalQueueItem[];
  activeWorkers?: OperationalStatusItem[];
  providerStatus?: OperationalStatusItem[];
  marketplaceStatus?: OperationalStatusItem[];
  apiHealth?: OperationalStatusItem[];
  storageStatus?: OperationalStatusItem[];
  processingStatistics?: KPIValue[];
  errorSummary?: OperationalQueueItem[];
  operationalAlerts?: OperationalActivityItem[];
  recentOperations?: OperationalActivityItem[];
  dataFreshness?: OperationalFreshnessItem[];
  metadata?: OperationsDashboardMetadata;
}

export interface AdministrationDashboardResponse {
  userSummary?: KPIValue[];
  rolesPermissionsSummary?: OperationalStatusItem[];
  workspaceSummary?: KPIValue[];
  apiKeyStatus?: OperationalStatusItem[];
  providerConnections?: OperationalStatusItem[];
  marketplaceConnections?: OperationalStatusItem[];
  configurationStatus?: OperationalStatusItem[];
  featureFlags?: OperationalStatusItem[];
  auditSummary?: KPIValue[];
  securityEvents?: OperationalActivityItem[];
  loginActivity?: OperationalActivityItem[];
  systemNotifications?: OperationalActivityItem[];
  scheduledJobs?: OperationalQueueItem[];
  backupStatus?: OperationalStatusItem[];
  maintenanceStatus?: OperationalStatusItem[];
  applicationVersion?: OperationalStatusItem[];
  environmentInformation?: OperationalStatusItem[];
  metadata?: OperationsDashboardMetadata;
}
