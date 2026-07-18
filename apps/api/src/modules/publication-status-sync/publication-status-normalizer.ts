import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import type { PublishingSubmissionResponse } from '../publishing-workflow/interfaces/publishing-provider.interface';
import { NormalizedPublicationStatus, PublicationStatusSource } from './entities/publication-status-sync.entity';
import type { NormalizedProviderStatusResult } from './interfaces/publication-status-sync.interface';

@Injectable()
export class PublicationStatusNormalizer {
  fromProvider(providerKey: string, targetExecutionId: string, response: PublishingSubmissionResponse, source: PublicationStatusSource): NormalizedProviderStatusResult {
    const sanitizedMetadata = this.sanitize(response.normalizedResponse);
    const fetchedAt = new Date();
    const rawStatus = response.providerStatus ?? response.status;
    const normalizedStatus = this.fromWorkflowStatus(response.status);
    const fingerprint = this.fingerprint({ providerKey, targetExecutionId, externalSubmissionId: response.externalSubmissionId, externalPublicationId: response.externalPublicationId, rawStatus, normalizedStatus, sanitizedMetadata });
    return { providerKey, targetExecutionId, externalSubmissionId: response.externalSubmissionId ?? null, externalPublicationId: response.externalPublicationId ?? null, rawStatusCode: String(rawStatus), rawStatusLabel: response.providerStatus ?? null, normalizedStatus, statusMessage: response.providerStatusMessage ?? null, actionRequiredDetails: null, rejectionDetails: normalizedStatus === NormalizedPublicationStatus.REJECTED ? { message: response.providerStatusMessage } : null, publicationUrl: typeof sanitizedMetadata.publicationUrl === 'string' ? sanitizedMetadata.publicationUrl : null, providerUpdatedAt: null, fetchedAt, source, retryAfter: null, nextRecommendedSyncAt: null, providerResponseFingerprint: fingerprint, sanitizedMetadata, warnings: [] };
  }
  manual(input: { providerKey: string; targetExecutionId: string; status: NormalizedPublicationStatus; statusMessage?: string; externalSubmissionId?: string; externalPublicationId?: string; publicationUrl?: string; providerUpdatedAt?: Date | null; source: PublicationStatusSource; actionRequiredDetails?: Record<string, unknown>; rejectionDetails?: Record<string, unknown> }): NormalizedProviderStatusResult {
    const fetchedAt = new Date();
    const sanitizedMetadata = this.sanitize({ manual: true });
    const fingerprint = this.fingerprint({ providerKey: input.providerKey, targetExecutionId: input.targetExecutionId, externalSubmissionId: input.externalSubmissionId ?? null, externalPublicationId: input.externalPublicationId ?? null, status: input.status, statusMessage: input.statusMessage ?? null, publicationUrl: input.publicationUrl ?? null, providerUpdatedAt: input.providerUpdatedAt?.toISOString() ?? null });
    return { providerKey: input.providerKey, targetExecutionId: input.targetExecutionId, externalSubmissionId: input.externalSubmissionId ?? null, externalPublicationId: input.externalPublicationId ?? null, rawStatusCode: input.status, rawStatusLabel: input.status, normalizedStatus: input.status, statusMessage: input.statusMessage ?? null, actionRequiredDetails: input.actionRequiredDetails ?? null, rejectionDetails: input.rejectionDetails ?? null, publicationUrl: input.publicationUrl ?? null, providerUpdatedAt: input.providerUpdatedAt ?? null, fetchedAt, source: input.source, retryAfter: null, nextRecommendedSyncAt: null, providerResponseFingerprint: fingerprint, sanitizedMetadata, warnings: [] };
  }
  fromWorkflowStatus(status: PublishingTargetStatus): NormalizedPublicationStatus {
    const map: Record<PublishingTargetStatus, NormalizedPublicationStatus> = { PENDING: NormalizedPublicationStatus.DRAFT, VALIDATING: NormalizedPublicationStatus.READY_FOR_SUBMISSION, READY: NormalizedPublicationStatus.READY_FOR_SUBMISSION, QUEUED: NormalizedPublicationStatus.READY_FOR_SUBMISSION, SUBMITTING: NormalizedPublicationStatus.PROCESSING, SUBMITTED: NormalizedPublicationStatus.SUBMITTED, PROCESSING: NormalizedPublicationStatus.PROCESSING, PUBLISHED: NormalizedPublicationStatus.LIVE, REJECTED: NormalizedPublicationStatus.REJECTED, RETRY_PENDING: NormalizedPublicationStatus.FAILED, FAILED: NormalizedPublicationStatus.FAILED, CANCELLED: NormalizedPublicationStatus.CANCELLED, SKIPPED: NormalizedPublicationStatus.UNKNOWN };
    return map[status] ?? NormalizedPublicationStatus.UNKNOWN;
  }
  toWorkflowStatus(status: NormalizedPublicationStatus): PublishingTargetStatus {
    if (status === NormalizedPublicationStatus.LIVE || status === NormalizedPublicationStatus.PARTIALLY_LIVE) return PublishingTargetStatus.PUBLISHED;
    if (status === NormalizedPublicationStatus.REJECTED) return PublishingTargetStatus.REJECTED;
    if (status === NormalizedPublicationStatus.CANCELLED || status === NormalizedPublicationStatus.REMOVED || status === NormalizedPublicationStatus.UNPUBLISHED) return PublishingTargetStatus.CANCELLED;
    if (status === NormalizedPublicationStatus.FAILED || status === NormalizedPublicationStatus.BLOCKED) return PublishingTargetStatus.FAILED;
    if (status === NormalizedPublicationStatus.SUBMITTED) return PublishingTargetStatus.SUBMITTED;
    if ([NormalizedPublicationStatus.PROCESSING, NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.ACTION_REQUIRED, NormalizedPublicationStatus.APPROVED, NormalizedPublicationStatus.PUBLISHING].includes(status)) return PublishingTargetStatus.PROCESSING;
    return PublishingTargetStatus.READY;
  }
  sanitize(input: Record<string, unknown>): Record<string, unknown> { const secret = /token|secret|password|cookie|authorization|credential|mfa/i; return Object.fromEntries(Object.entries(input ?? {}).filter(([key]) => !secret.test(key)).map(([key, value]) => [key, typeof value === 'object' && value !== null ? '[redacted-object]' : value])); }
  fingerprint(input: Record<string, unknown>): string { return createHash('sha256').update(JSON.stringify(input)).digest('hex'); }
}
