import { BadRequestException } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { GooglePlayBooksIntegrationMode } from './entities/google-play-books.entity';
import { GooglePlayBooksErrorMapper } from './google-play-books-error.mapper';
import { GooglePlayBooksPublishingProvider } from './google-play-books-publishing.provider';

describe('GooglePlayBooksPublishingProvider', () => {
  const provider = new GooglePlayBooksPublishingProvider(new GooglePlayBooksErrorMapper());
  it('declares manual Google Play Books capabilities without automatic polling or cancellation', () => {
    const capabilities = provider.getCapabilities();
    expect(capabilities.providerKey).toBe('GOOGLE_PLAY_BOOKS');
    expect(capabilities.supportsStatusPolling).toBe(false);
    expect(capabilities.supportsCancellation).toBe(false);
  });
  it('rejects unavailable API mode', async () => {
    await expect(provider.validateConfiguration({ integrationMode: GooglePlayBooksIntegrationMode.API })).rejects.toThrow(BadRequestException);
  });
  it('returns ready-for-manual-submission without external Google request', async () => {
    const response = await provider.submit({ idempotencyKey: 'idem', submissionFingerprint: 'abcdef1234567890', packageReference: { reference: 'pkg', checksum: 'sha', artifactIds: ['a'], metadata: {} }, targetConfiguration: { integrationMode: GooglePlayBooksIntegrationMode.MANUAL_ASSISTED } });
    expect(response.status).toBe(PublishingTargetStatus.READY);
    expect(response.normalizedResponse.externalSubmissionPerformed).toBe(false);
    expect(response.normalizedResponse.publicVolumesApiUsedForPublishing).toBe(false);
  });
});
