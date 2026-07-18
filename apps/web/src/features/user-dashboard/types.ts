import type { DashboardDataCompleteness, DashboardFreshnessMetadata, KPIValue, TrendValue } from '@/features/analytics-dashboard/types';

export type UserDashboardSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserDashboardStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'STALE' | 'UNKNOWN';

export interface UserDashboardMetadata {
  generatedAt?: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
}

export interface UserDashboardSummaryResponse {
  activeBooks?: number | null;
  activeEditions?: number | null;
  publishingStatus?: string;
  sales?: number | null;
  revenue?: number | null;
  royalties?: number | null;
  pendingActions?: number | null;
  opportunityCount?: number | null;
  aiInsightCount?: number | null;
  alertCount?: number | null;
  metadata?: UserDashboardMetadata;
}

export interface UserKPIItem extends KPIValue {
  key: string;
  freshness?: DashboardFreshnessMetadata;
  completeness?: DashboardDataCompleteness;
  drillDownPath?: string;
}

export interface UserBookItem {
  id: string;
  title: string;
  subtitle?: string;
  author?: string;
  coverUrl?: string;
  status?: string;
  publishingStatus?: string;
  analyticsBadge?: string;
  opportunityCount?: number | null;
  aiInsightCount?: number | null;
  favorite?: boolean;
  updatedAt?: string;
  drillDownPath?: string;
}

export interface UserWorkItem {
  id: string;
  type: string;
  title: string;
  subtitle?: string;
  status?: UserDashboardStatus | string;
  updatedAt?: string;
  resumePath?: string;
}

export interface UserFavoriteItem {
  id: string;
  type: 'BOOK' | 'AUTHOR' | 'PROJECT';
  title: string;
  subtitle?: string;
  openPath?: string;
}

export interface UserActivityItem {
  id: string;
  type: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: string;
  entity?: string;
  path?: string;
}

export interface UserImportItem {
  id: string;
  source?: string;
  status: UserDashboardStatus | string;
  importedAt?: string;
  statistics?: string;
  path?: string;
}

export interface UserSyncItem {
  id: string;
  provider?: string;
  marketplace?: string;
  status: UserDashboardStatus | string;
  syncedAt?: string;
  path?: string;
}

export interface UserAnalyticsUpdateItem {
  id: string;
  title: string;
  scope?: string;
  refreshedAt?: string;
  freshness?: DashboardFreshnessMetadata;
  path?: string;
}

export interface UserOpportunityItem {
  id: string;
  title: string;
  priority?: string;
  score?: number;
  confidence?: number;
  status?: string;
  actionPath?: string;
}

export interface UserAIInsightItem {
  id: string;
  title: string;
  summary: string;
  category?: string;
  priority?: string;
  confidence?: number;
  generatedAt?: string;
  path?: string;
}

export interface UserAlertItem {
  id: string;
  title: string;
  severity: UserDashboardSeverity;
  timestamp?: string;
  source?: string;
  path?: string;
}

export interface UserQuickAction {
  id: string;
  label: string;
  description?: string;
  path: string;
  permission?: string;
}

export interface UserFreshnessItem {
  id: string;
  label: string;
  status: DashboardFreshnessMetadata['status'];
  timestamp?: string;
  completeness?: DashboardDataCompleteness;
}

export interface UserDashboardResponse {
  summary?: UserDashboardSummaryResponse;
  kpis?: UserKPIItem[];
  books?: UserBookItem[];
  continueWorking?: UserWorkItem[];
  favorites?: UserFavoriteItem[];
  recentActivity?: UserActivityItem[];
  recentImports?: UserImportItem[];
  recentSyncs?: UserSyncItem[];
  recentAnalytics?: UserAnalyticsUpdateItem[];
  opportunities?: UserOpportunityItem[];
  aiInsights?: UserAIInsightItem[];
  alerts?: UserAlertItem[];
  quickActions?: UserQuickAction[];
  freshness?: UserFreshnessItem[];
  metadata?: UserDashboardMetadata;
}
