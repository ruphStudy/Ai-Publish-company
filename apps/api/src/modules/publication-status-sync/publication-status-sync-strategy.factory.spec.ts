import { PublishingCapability } from '../publishing-workflow/entities/publishing-workflow.entity';
import { ProviderSyncStatus } from './entities/publication-status-sync.entity';
import { PublicationStatusSyncStrategyFactory } from './publication-status-sync-strategy.factory';

describe('PublicationStatusSyncStrategyFactory', () => {
  const factory = new PublicationStatusSyncStrategyFactory();

  it('keeps manual-assisted providers manual only', () => {
    const result = factory.eligibility({ providerKey: 'AMAZON_KDP', supportsStatusPolling: true, externalSubmissionId: 'sub-1' });

    expect(result.eligible).toBe(false);
    expect(result.syncStatus).toBe(ProviderSyncStatus.MANUAL_ONLY);
  });

  it('allows API-enabled mock provider when polling and external references exist', () => {
    expect(PublishingCapability.STATUS_POLLING).toBe('STATUS_POLLING');
    const result = factory.eligibility({ providerKey: 'mock', supportsStatusPolling: true, externalSubmissionId: 'sub-1' });

    expect(result.eligible).toBe(true);
    expect(result.syncStatus).toBe(ProviderSyncStatus.QUEUED);
  });

  it('rejects unsupported polling and missing external identifiers', () => {
    expect(factory.eligibility({ providerKey: 'mock', supportsStatusPolling: false, externalSubmissionId: 'sub-1' }).syncStatus).toBe(ProviderSyncStatus.MANUAL_ONLY);
    expect(factory.eligibility({ providerKey: 'mock', supportsStatusPolling: true }).eligible).toBe(false);
  });
});
