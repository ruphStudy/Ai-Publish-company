import { BadRequestException } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { AmazonKdpErrorMapper } from './amazon-kdp-error.mapper';
import { AmazonKdpPublishingProvider } from './amazon-kdp-publishing.provider';
import { AmazonKdpIntegrationMode } from './entities/amazon-kdp.entity';

describe('AmazonKdpPublishingProvider', () => {
  const provider = new AmazonKdpPublishingProvider(new AmazonKdpErrorMapper());
  it('declares manual KDP capabilities without automatic polling or cancellation', () => {
    const capabilities = provider.getCapabilities();
    expect(capabilities.providerKey).toBe('AMAZON_KDP');
    expect(capabilities.supportsStatusPolling).toBe(false);
    expect(capabilities.supportsCancellation).toBe(false);
  });
  it('rejects unavailable API mode', async () => {
    await expect(provider.validateConfiguration({ integrationMode: AmazonKdpIntegrationMode.API })).rejects.toThrow(BadRequestException);
  });
  it('returns ready-for-manual-submission without external Amazon request', async () => {
    const response = await provider.submit({ idempotencyKey: 'idem', submissionFingerprint: 'abcdef1234567890', packageReference: { reference: 'pkg', checksum: 'sha', artifactIds: ['a'], metadata: {} }, targetConfiguration: { integrationMode: AmazonKdpIntegrationMode.MANUAL_ASSISTED } });
    expect(response.status).toBe(PublishingTargetStatus.READY);
    expect(response.normalizedResponse.externalSubmissionPerformed).toBe(false);
  });
});
