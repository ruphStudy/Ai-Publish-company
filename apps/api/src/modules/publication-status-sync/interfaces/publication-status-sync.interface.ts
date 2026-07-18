import type { NormalizedPublicationStatus, PublicationStatusSource } from '../entities/publication-status-sync.entity';

export interface NormalizedProviderStatusResult {
  providerKey: string;
  targetExecutionId: string;
  externalSubmissionId: string | null;
  externalPublicationId: string | null;
  rawStatusCode: string | null;
  rawStatusLabel: string | null;
  normalizedStatus: NormalizedPublicationStatus;
  statusMessage: string | null;
  actionRequiredDetails: Record<string, unknown> | null;
  rejectionDetails: Record<string, unknown> | null;
  publicationUrl: string | null;
  providerUpdatedAt: Date | null;
  fetchedAt: Date;
  source: PublicationStatusSource;
  retryAfter: Date | null;
  nextRecommendedSyncAt: Date | null;
  providerResponseFingerprint: string;
  sanitizedMetadata: Record<string, unknown>;
  warnings: string[];
}
export interface PublicationStatusConflict { conflictId: string; targetExecutionId: string; previousStatus: NormalizedPublicationStatus | null; nextStatus: NormalizedPublicationStatus; source: PublicationStatusSource; policy: string; requiresManualReview: boolean; metadata: Record<string, unknown> }
export interface SyncEligibilityResult { eligible: boolean; syncStatus: string; reason?: string }
export interface ReconciliationReport { projectId?: string; workflowId?: string; orchestrationId?: string; targetExecutionId?: string; safeFixes: string[]; unsafeFindings: string[]; applied: boolean }
