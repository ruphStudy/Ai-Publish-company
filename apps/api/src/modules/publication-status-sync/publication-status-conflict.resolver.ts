import { randomUUID } from 'crypto';
import { Injectable } from '@nestjs/common';
import { PublicationStatusSyncPolicy } from './config/publication-status-sync.config';
import { NormalizedPublicationStatus, PublicationStatusConflictPolicy, PublicationStatusSource } from './entities/publication-status-sync.entity';
import type { NormalizedProviderStatusResult, PublicationStatusConflict } from './interfaces/publication-status-sync.interface';

@Injectable()
export class PublicationStatusConflictResolver {
  detect(previous: { status: NormalizedPublicationStatus | null; providerUpdatedAt: Date | null; source: PublicationStatusSource | null; externalSubmissionId?: string | null } | null, next: NormalizedProviderStatusResult, policy: PublicationStatusSyncPolicy): PublicationStatusConflict | null {
    if (!previous?.status) return null;
    const sameTimestamp = previous.providerUpdatedAt?.getTime() === next.providerUpdatedAt?.getTime() && previous.status !== next.normalizedStatus;
    const externalMismatch = Boolean(previous.externalSubmissionId && next.externalSubmissionId && previous.externalSubmissionId !== next.externalSubmissionId);
    const terminalRegression = policy.protectedTerminalStatuses.includes(previous.status) && !policy.terminalStatuses.includes(next.normalizedStatus);
    if (!sameTimestamp && !externalMismatch && !terminalRegression) return null;
    return { conflictId: `PSC-${randomUUID()}`, targetExecutionId: next.targetExecutionId, previousStatus: previous.status, nextStatus: next.normalizedStatus, source: next.source, policy: policy.conflictPolicy, requiresManualReview: policy.conflictPolicy === PublicationStatusConflictPolicy.REQUIRE_MANUAL_REVIEW || policy.conflictPolicy === PublicationStatusConflictPolicy.BLOCK_SYNC, metadata: { sameTimestamp, externalMismatch, terminalRegression } };
  }
  shouldApply(conflict: PublicationStatusConflict | null, previous: { providerUpdatedAt: Date | null; source: PublicationStatusSource | null } | null, next: NormalizedProviderStatusResult, policy: PublicationStatusSyncPolicy): boolean {
    if (!conflict) return true;
    if (policy.conflictPolicy === PublicationStatusConflictPolicy.BLOCK_SYNC || policy.conflictPolicy === PublicationStatusConflictPolicy.REQUIRE_MANUAL_REVIEW || policy.conflictPolicy === PublicationStatusConflictPolicy.RECORD_ONLY) return false;
    if (policy.conflictPolicy === PublicationStatusConflictPolicy.PROVIDER_WINS) return [PublicationStatusSource.PROVIDER_API, PublicationStatusSource.PROVIDER_WEBHOOK, PublicationStatusSource.SCHEDULED_POLL].includes(next.source);
    if (policy.conflictPolicy === PublicationStatusConflictPolicy.MANUAL_WINS) return [PublicationStatusSource.MANUAL_UPDATE, PublicationStatusSource.ADMIN_CORRECTION].includes(next.source);
    if (policy.conflictPolicy === PublicationStatusConflictPolicy.LATEST_TIMESTAMP_WINS) return !previous?.providerUpdatedAt || !next.providerUpdatedAt || next.providerUpdatedAt >= previous.providerUpdatedAt;
    return policy.sourcePrecedence.indexOf(next.source) <= policy.sourcePrecedence.indexOf(previous?.source ?? PublicationStatusSource.WORKFLOW_EVENT);
  }
}
