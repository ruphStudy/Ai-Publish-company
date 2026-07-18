import { Injectable } from '@nestjs/common';
import { ProviderStatusSyncConfig, PublicationStatusSyncPolicy, publicationStatusSyncDefaultPolicy } from './config/publication-status-sync.config';
import { PublicationPollingStrategy, ProviderSyncStatus } from './entities/publication-status-sync.entity';
import type { SyncEligibilityResult } from './interfaces/publication-status-sync.interface';

@Injectable()
export class PublicationStatusSyncStrategyFactory {
  policy(): PublicationStatusSyncPolicy { return publicationStatusSyncDefaultPolicy; }
  provider(providerKey: string): ProviderStatusSyncConfig | null { return this.policy().providers.find((provider) => provider.providerKey === providerKey) ?? null; }
  eligibility(input: { providerKey: string; supportsStatusPolling: boolean; externalSubmissionId?: string | null; terminalProtected?: boolean; activeSync?: boolean; retryCount?: number }): SyncEligibilityResult {
    const config = this.provider(input.providerKey);
    if (!config?.enabled) return { eligible: false, syncStatus: ProviderSyncStatus.DISABLED, reason: 'Provider sync is disabled' };
    if (!config.syncEnabled) return { eligible: false, syncStatus: ProviderSyncStatus.NOT_CONFIGURED, reason: 'Provider sync is not configured' };
    if (config.manualOnly || !input.supportsStatusPolling || config.pollingStrategy === PublicationPollingStrategy.NONE) return { eligible: false, syncStatus: ProviderSyncStatus.MANUAL_ONLY, reason: 'Provider requires manual status updates' };
    if (!input.externalSubmissionId) return { eligible: false, syncStatus: ProviderSyncStatus.FAILED, reason: 'External submission identifier is required' };
    if (input.terminalProtected) return { eligible: false, syncStatus: ProviderSyncStatus.IDLE, reason: 'Protected terminal status' };
    if (input.activeSync) return { eligible: false, syncStatus: ProviderSyncStatus.SYNCING, reason: 'Active sync already exists' };
    if ((input.retryCount ?? 0) > config.maximumRetries) return { eligible: false, syncStatus: ProviderSyncStatus.FAILED, reason: 'Maximum retries exceeded' };
    return { eligible: true, syncStatus: ProviderSyncStatus.QUEUED };
  }
  nextSyncAt(config: ProviderStatusSyncConfig, attempt: number, providerRetryAfter?: Date | null): Date | null {
    if (config.pollingStrategy === PublicationPollingStrategy.NONE) return null;
    if (config.pollingStrategy === PublicationPollingStrategy.PROVIDER_DIRECTED && providerRetryAfter) return providerRetryAfter;
    const delay = config.pollingStrategy === PublicationPollingStrategy.EXPONENTIAL ? config.pollingIntervalMs * 2 ** Math.max(0, attempt - 1) : config.pollingIntervalMs;
    return new Date(Date.now() + delay);
  }
}
