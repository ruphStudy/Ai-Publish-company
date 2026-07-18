import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { NormalizedPublicationStatus, PublicationStatusSource } from './entities/publication-status-sync.entity';
import { PublicationStatusNormalizer } from './publication-status-normalizer';

describe('PublicationStatusNormalizer', () => {
  const normalizer = new PublicationStatusNormalizer();

  it('normalizes provider publication status and redacts sensitive metadata', () => {
    const result = normalizer.fromProvider('mock', 'target-1', { externalSubmissionId: 'sub-1', externalPublicationId: 'pub-1', status: PublishingTargetStatus.PUBLISHED, providerStatus: 'PUBLISHED', providerStatusMessage: 'Live', normalizedResponse: { publicationUrl: 'https://books.example/test', token: 'secret' } }, PublicationStatusSource.PROVIDER_API);

    expect(result.normalizedStatus).toBe(NormalizedPublicationStatus.LIVE);
    expect(result.publicationUrl).toBe('https://books.example/test');
    expect(result.sanitizedMetadata.token).toBeUndefined();
    expect(result.providerResponseFingerprint).toHaveLength(64);
  });

  it('creates deterministic duplicate manual fingerprints', () => {
    const first = normalizer.manual({ providerKey: 'mock', targetExecutionId: 'target-1', status: NormalizedPublicationStatus.ACTION_REQUIRED, statusMessage: 'Needs correction', source: PublicationStatusSource.MANUAL_UPDATE });
    const second = normalizer.manual({ providerKey: 'mock', targetExecutionId: 'target-1', status: NormalizedPublicationStatus.ACTION_REQUIRED, statusMessage: 'Needs correction', source: PublicationStatusSource.MANUAL_UPDATE });

    expect(first.providerResponseFingerprint).toBe(second.providerResponseFingerprint);
  });
});
