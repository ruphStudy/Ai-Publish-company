import { NormalizedPublicationStatus, PublicationPollingStrategy, PublicationStatusConflictPolicy, PublicationStatusSource } from '../entities/publication-status-sync.entity';

export interface ProviderStatusSyncConfig { providerKey: string; enabled: boolean; syncEnabled: boolean; manualOnly: boolean; pollingStrategy: PublicationPollingStrategy; pollingIntervalMs: number; initialPollingDelayMs: number; maximumPollingDurationMs: number; maximumRetries: number; retryDelayMs: number; batchSize: number; workerConcurrency: number; providerConcurrency: number; requestTimeoutMs: number; failureThreshold: number; resetTimeoutMs: number }
export interface PublicationStatusSyncPolicy {
  policyVersion: string;
  providers: ProviderStatusSyncConfig[];
  staleToleranceMs: number;
  sourcePrecedence: PublicationStatusSource[];
  terminalStatuses: NormalizedPublicationStatus[];
  protectedTerminalStatuses: NormalizedPublicationStatus[];
  conflictPolicy: PublicationStatusConflictPolicy;
  terminalStatusProtection: boolean;
  unknownStatusPolicy: 'RECORD_ONLY' | 'APPLY_UNKNOWN' | 'BLOCK';
  retentionDays: number;
}
export const publicationStatusSyncDefaultPolicy: PublicationStatusSyncPolicy = {
  policyVersion: 'publication-status-sync-default-v1',
  staleToleranceMs: 60_000,
  sourcePrecedence: [PublicationStatusSource.ADMIN_CORRECTION, PublicationStatusSource.PROVIDER_WEBHOOK, PublicationStatusSource.PROVIDER_API, PublicationStatusSource.MANUAL_UPDATE, PublicationStatusSource.SCHEDULED_POLL, PublicationStatusSource.WORKFLOW_EVENT, PublicationStatusSource.ORCHESTRATION_EVENT, PublicationStatusSource.SYSTEM_RECONCILIATION],
  terminalStatuses: [NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.REMOVED, NormalizedPublicationStatus.CANCELLED, NormalizedPublicationStatus.UNPUBLISHED],
  protectedTerminalStatuses: [NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.REMOVED, NormalizedPublicationStatus.CANCELLED, NormalizedPublicationStatus.UNPUBLISHED],
  conflictPolicy: PublicationStatusConflictPolicy.HIGHEST_PRECEDENCE_SOURCE_WINS,
  terminalStatusProtection: true,
  unknownStatusPolicy: 'RECORD_ONLY',
  retentionDays: 730,
  providers: [
    { providerKey: 'AMAZON_KDP', enabled: true, syncEnabled: true, manualOnly: true, pollingStrategy: PublicationPollingStrategy.NONE, pollingIntervalMs: 900_000, initialPollingDelayMs: 300_000, maximumPollingDurationMs: 2_592_000_000, maximumRetries: 3, retryDelayMs: 300_000, batchSize: 25, workerConcurrency: 3, providerConcurrency: 1, requestTimeoutMs: 30_000, failureThreshold: 5, resetTimeoutMs: 900_000 },
    { providerKey: 'DRAFT2DIGITAL', enabled: true, syncEnabled: true, manualOnly: true, pollingStrategy: PublicationPollingStrategy.NONE, pollingIntervalMs: 900_000, initialPollingDelayMs: 300_000, maximumPollingDurationMs: 2_592_000_000, maximumRetries: 3, retryDelayMs: 300_000, batchSize: 25, workerConcurrency: 3, providerConcurrency: 1, requestTimeoutMs: 30_000, failureThreshold: 5, resetTimeoutMs: 900_000 },
    { providerKey: 'GOOGLE_PLAY_BOOKS', enabled: true, syncEnabled: true, manualOnly: true, pollingStrategy: PublicationPollingStrategy.NONE, pollingIntervalMs: 900_000, initialPollingDelayMs: 300_000, maximumPollingDurationMs: 2_592_000_000, maximumRetries: 3, retryDelayMs: 300_000, batchSize: 25, workerConcurrency: 3, providerConcurrency: 1, requestTimeoutMs: 30_000, failureThreshold: 5, resetTimeoutMs: 900_000 },
    { providerKey: 'mock', enabled: true, syncEnabled: true, manualOnly: false, pollingStrategy: PublicationPollingStrategy.PROVIDER_DIRECTED, pollingIntervalMs: 60_000, initialPollingDelayMs: 5_000, maximumPollingDurationMs: 86_400_000, maximumRetries: 3, retryDelayMs: 5_000, batchSize: 25, workerConcurrency: 3, providerConcurrency: 2, requestTimeoutMs: 10_000, failureThreshold: 5, resetTimeoutMs: 60_000 },
  ],
};
