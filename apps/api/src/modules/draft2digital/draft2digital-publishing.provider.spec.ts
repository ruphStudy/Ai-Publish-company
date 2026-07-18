import { BadRequestException } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { Draft2DigitalErrorMapper } from './draft2digital-error.mapper';
import { Draft2DigitalPublishingProvider } from './draft2digital-publishing.provider';
import { Draft2DigitalIntegrationMode } from './entities/draft2digital.entity';

describe('Draft2DigitalPublishingProvider', () => {
  const provider = new Draft2DigitalPublishingProvider(new Draft2DigitalErrorMapper());
  it('declares manual Draft2Digital capabilities without automatic polling or cancellation', () => {
    const capabilities = provider.getCapabilities();
    expect(capabilities.providerKey).toBe('DRAFT2DIGITAL');
    expect(capabilities.supportsStatusPolling).toBe(false);
    expect(capabilities.supportsCancellation).toBe(false);
  });
  it('rejects unavailable API mode', async () => {
    await expect(provider.validateConfiguration({ integrationMode: Draft2DigitalIntegrationMode.API })).rejects.toThrow(BadRequestException);
  });
  it('returns ready-for-manual-submission without external publishing', async () => {
    const response = await provider.submit({ idempotencyKey: 'idem', submissionFingerprint: 'abcdef1234567890', packageReference: { reference: 'pkg', checksum: 'sha', artifactIds: ['a'], metadata: {} }, targetConfiguration: { integrationMode: Draft2DigitalIntegrationMode.MANUAL_ASSISTED } });
    expect(response.status).toBe(PublishingTargetStatus.READY);
    expect(response.normalizedResponse.externalSubmissionPerformed).toBe(false);
  });
});
