import { Injectable } from '@nestjs/common';
import { platformProviderRegistryDefaults } from '../../../core/platform';
import { PublishingCapability, PublishingTargetStatus } from '../entities/publishing-workflow.entity';
import type { PublishingPackageReference, PublishingProvider, PublishingProviderCapabilities, PublishingProviderError, PublishingSubmissionRequest, PublishingSubmissionResponse } from '../interfaces/publishing-provider.interface';

@Injectable()
export class MockPublishingProvider implements PublishingProvider {
  async validateConfiguration(): Promise<void> {}
  async validatePackage(pkg: PublishingPackageReference): Promise<void> { if (!pkg.reference || !pkg.checksum) throw new Error('Invalid publishing package'); }
  async prepareSubmission(request: PublishingSubmissionRequest): Promise<PublishingSubmissionRequest> { return request; }
  async submit(request: PublishingSubmissionRequest): Promise<PublishingSubmissionResponse> { return { externalSubmissionId: `mock-sub-${request.submissionFingerprint.slice(0, 16)}`, status: PublishingTargetStatus.SUBMITTED, providerStatus: 'SUBMITTED', providerStatusMessage: 'Mock submission accepted', normalizedResponse: { provider: 'mock', submitted: true } }; }
  async getSubmissionStatus(externalSubmissionId: string): Promise<PublishingSubmissionResponse> { return { externalSubmissionId, status: PublishingTargetStatus.PUBLISHED, providerStatus: 'PUBLISHED', providerStatusMessage: 'Mock publication completed', normalizedResponse: { provider: 'mock', published: true } }; }
  async cancelSubmission(externalSubmissionId: string): Promise<PublishingSubmissionResponse> { return { externalSubmissionId, status: PublishingTargetStatus.CANCELLED, providerStatus: 'CANCELLED', providerStatusMessage: 'Mock submission cancelled', normalizedResponse: { provider: 'mock', cancelled: true } }; }
  mapProviderError(error: unknown): PublishingProviderError { return { code: 'MOCK_PROVIDER_ERROR', message: error instanceof Error ? error.message : 'Mock provider error', retryable: true, category: 'PROVIDER' }; }
  normalizeProviderResponse(response: unknown): Record<string, unknown> { return typeof response === 'object' && response ? { ...response } as Record<string, unknown> : { response }; }
  getCapabilities(): PublishingProviderCapabilities { return { providerKey: 'mock', capabilities: [PublishingCapability.EBOOK, PublishingCapability.PRINT, PublishingCapability.STATUS_POLLING, PublishingCapability.CANCELLATION, PublishingCapability.FILE_REPLACEMENT], supportsCancellation: true, supportsStatusPolling: true }; }
  getMetadata() { return platformProviderRegistryDefaults.find((provider) => provider.identifier === this.getCapabilities().providerKey) ?? null; }
}
