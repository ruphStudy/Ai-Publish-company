import { BadRequestException, Injectable } from '@nestjs/common';
import { platformProviderRegistryDefaults } from '../../core/platform';
import { PublishingCapability, PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import type { PublishingPackageReference, PublishingProvider, PublishingProviderCapabilities, PublishingProviderError, PublishingSubmissionRequest, PublishingSubmissionResponse } from '../publishing-workflow/interfaces/publishing-provider.interface';
import { AmazonKdpErrorMapper } from './amazon-kdp-error.mapper';
import { AmazonKdpIntegrationMode } from './entities/amazon-kdp.entity';

@Injectable()
export class AmazonKdpPublishingProvider implements PublishingProvider {
  constructor(private readonly errors: AmazonKdpErrorMapper) {}
  async validateConfiguration(config: Record<string, unknown>): Promise<void> { if (config.integrationMode === AmazonKdpIntegrationMode.API) throw new BadRequestException('Amazon KDP API mode is unavailable until an official API adapter is configured'); }
  async validatePackage(pkg: PublishingPackageReference): Promise<void> { if (!pkg.reference || !pkg.checksum || !pkg.artifactIds.length) throw new BadRequestException('KDP package requires artifact references and checksum'); }
  async prepareSubmission(request: PublishingSubmissionRequest): Promise<PublishingSubmissionRequest> { await this.validateConfiguration(request.targetConfiguration); await this.validatePackage(request.packageReference); return request; }
  async submit(request: PublishingSubmissionRequest): Promise<PublishingSubmissionResponse> { await this.prepareSubmission(request); return { externalSubmissionId: `manual-kdp-${request.submissionFingerprint.slice(0, 16)}`, status: PublishingTargetStatus.READY, providerStatus: 'READY_FOR_SUBMISSION', providerStatusMessage: 'KDP manual-assisted package is ready. No Amazon submission has occurred.', normalizedResponse: { provider: 'AMAZON_KDP', integrationMode: AmazonKdpIntegrationMode.MANUAL_ASSISTED, externalSubmissionPerformed: false, manualSubmissionRequired: true } }; }
  async getSubmissionStatus(externalSubmissionId: string): Promise<PublishingSubmissionResponse> { return { externalSubmissionId, status: PublishingTargetStatus.READY, providerStatus: 'READY_FOR_SUBMISSION', providerStatusMessage: 'Awaiting manually recorded KDP status.', normalizedResponse: { provider: 'AMAZON_KDP', statusSource: 'MANUAL_APC_RECORD' } }; }
  async cancelSubmission(externalSubmissionId: string): Promise<PublishingSubmissionResponse> { return { externalSubmissionId, status: PublishingTargetStatus.CANCELLED, providerStatus: 'LOCAL_CANCELLED', providerStatusMessage: 'Only the local APC workflow was cancelled. KDP remote cancellation is not automated.', normalizedResponse: { provider: 'AMAZON_KDP', remoteCancellationPerformed: false } }; }
  mapProviderError(error: unknown): PublishingProviderError { return this.errors.map(error); }
  normalizeProviderResponse(response: unknown): Record<string, unknown> { return this.errors.redact(typeof response === 'object' && response ? response as Record<string, unknown> : { response }); }
  getCapabilities(): PublishingProviderCapabilities { return { providerKey: 'AMAZON_KDP', capabilities: [PublishingCapability.EBOOK, PublishingCapability.PAPERBACK, PublishingCapability.HARDCOVER, PublishingCapability.PREORDER, PublishingCapability.TERRITORY_SELECTION, PublishingCapability.PRICING, PublishingCapability.DRM, PublishingCapability.ISBN, PublishingCapability.AUTHOR_PROFILE, PublishingCapability.CONTRIBUTORS, PublishingCapability.SERIES, PublishingCapability.CATEGORIES, PublishingCapability.KEYWORDS, PublishingCapability.STATUS_MANUAL_UPDATE, PublishingCapability.METADATA_UPDATE, PublishingCapability.FILE_REPLACEMENT, PublishingCapability.PRINT_OPTIONS], supportsCancellation: false, supportsStatusPolling: false }; }
  getMetadata() { return platformProviderRegistryDefaults.find((provider) => provider.identifier === this.getCapabilities().providerKey) ?? null; }
}
