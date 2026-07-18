import { publicationStatusSyncDefaultPolicy } from './config/publication-status-sync.config';
import { NormalizedPublicationStatus, PublicationStatusConflictPolicy, PublicationStatusSource } from './entities/publication-status-sync.entity';
import type { NormalizedProviderStatusResult } from './interfaces/publication-status-sync.interface';
import { PublicationStatusConflictResolver } from './publication-status-conflict.resolver';

describe('PublicationStatusConflictResolver', () => {
  const resolver = new PublicationStatusConflictResolver();
  const next = (status: NormalizedPublicationStatus, source = PublicationStatusSource.PROVIDER_API): NormalizedProviderStatusResult => ({ providerKey: 'mock', targetExecutionId: 'target-1', externalSubmissionId: 'sub-1', externalPublicationId: null, rawStatusCode: status, rawStatusLabel: status, normalizedStatus: status, statusMessage: null, actionRequiredDetails: null, rejectionDetails: null, publicationUrl: null, providerUpdatedAt: new Date('2026-01-01T00:00:00.000Z'), fetchedAt: new Date('2026-01-01T00:00:01.000Z'), source, retryAfter: null, nextRecommendedSyncAt: null, providerResponseFingerprint: `${status}-${source}`, sanitizedMetadata: {}, warnings: [] });

  it('detects terminal regression conflicts', () => {
    const conflict = resolver.detect({ status: NormalizedPublicationStatus.LIVE, providerUpdatedAt: new Date('2026-01-01T00:00:00.000Z'), source: PublicationStatusSource.PROVIDER_API, externalSubmissionId: 'sub-1' }, next(NormalizedPublicationStatus.IN_REVIEW), publicationStatusSyncDefaultPolicy);

    expect(conflict?.requiresManualReview).toBe(false);
    expect(conflict?.metadata.terminalRegression).toBe(true);
  });

  it('applies provider-wins and manual-wins policies deterministically', () => {
    expect(resolver.shouldApply({ conflictId: 'c', targetExecutionId: 'target-1', previousStatus: NormalizedPublicationStatus.IN_REVIEW, nextStatus: NormalizedPublicationStatus.LIVE, source: PublicationStatusSource.PROVIDER_API, policy: PublicationStatusConflictPolicy.PROVIDER_WINS, requiresManualReview: false, metadata: {} }, null, next(NormalizedPublicationStatus.LIVE), { ...publicationStatusSyncDefaultPolicy, conflictPolicy: PublicationStatusConflictPolicy.PROVIDER_WINS })).toBe(true);
    expect(resolver.shouldApply({ conflictId: 'c', targetExecutionId: 'target-1', previousStatus: NormalizedPublicationStatus.IN_REVIEW, nextStatus: NormalizedPublicationStatus.LIVE, source: PublicationStatusSource.MANUAL_UPDATE, policy: PublicationStatusConflictPolicy.MANUAL_WINS, requiresManualReview: false, metadata: {} }, null, next(NormalizedPublicationStatus.LIVE, PublicationStatusSource.MANUAL_UPDATE), { ...publicationStatusSyncDefaultPolicy, conflictPolicy: PublicationStatusConflictPolicy.MANUAL_WINS })).toBe(true);
  });
});
