import type { PlatformProviderMetadata } from '../../../core/platform';
import type { PublishingCapability, PublishingTargetStatus } from '../entities/publishing-workflow.entity';

export interface PublishingPackageReference { reference: string; checksum: string; artifactIds: string[]; metadata: Record<string, unknown> }
export interface PublishingProviderCapabilities { providerKey: string; capabilities: PublishingCapability[]; supportsCancellation: boolean; supportsStatusPolling: boolean }
export interface PublishingSubmissionRequest { idempotencyKey: string; submissionFingerprint: string; packageReference: PublishingPackageReference; targetConfiguration: Record<string, unknown> }
export interface PublishingSubmissionResponse { externalSubmissionId: string; externalPublicationId?: string; status: PublishingTargetStatus; providerStatus: string; providerStatusMessage: string; normalizedResponse: Record<string, unknown> }
export interface PublishingProviderError { code: string; message: string; retryable: boolean; category: string }
export interface PublishingProvider {
  validateConfiguration(config: Record<string, unknown>): Promise<void>;
  validatePackage(pkg: PublishingPackageReference): Promise<void>;
  prepareSubmission(request: PublishingSubmissionRequest): Promise<PublishingSubmissionRequest>;
  submit(request: PublishingSubmissionRequest): Promise<PublishingSubmissionResponse>;
  getSubmissionStatus(externalSubmissionId: string): Promise<PublishingSubmissionResponse>;
  cancelSubmission(externalSubmissionId: string): Promise<PublishingSubmissionResponse>;
  mapProviderError(error: unknown): PublishingProviderError;
  normalizeProviderResponse(response: unknown): Record<string, unknown>;
  getCapabilities(): PublishingProviderCapabilities;
  getMetadata?(): PlatformProviderMetadata | null;
}
