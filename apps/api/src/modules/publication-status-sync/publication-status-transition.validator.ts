import { BadRequestException, Injectable } from '@nestjs/common';
import { publicationStatusSyncDefaultPolicy } from './config/publication-status-sync.config';
import { NormalizedPublicationStatus, PublicationStatusSource } from './entities/publication-status-sync.entity';

@Injectable()
export class PublicationStatusTransitionValidator {
  validate(previous: NormalizedPublicationStatus | null, next: NormalizedPublicationStatus, source: PublicationStatusSource, options: { reconciliation?: boolean; correction?: boolean } = {}): void {
    if (!previous || previous === next || options.reconciliation || options.correction || source === PublicationStatusSource.ADMIN_CORRECTION) return;
    const allowed: Record<NormalizedPublicationStatus, NormalizedPublicationStatus[]> = {
      DRAFT: [NormalizedPublicationStatus.READY_FOR_SUBMISSION, NormalizedPublicationStatus.CANCELLED, NormalizedPublicationStatus.UNKNOWN],
      READY_FOR_SUBMISSION: [NormalizedPublicationStatus.AWAITING_MANUAL_SUBMISSION, NormalizedPublicationStatus.SUBMITTED, NormalizedPublicationStatus.BLOCKED, NormalizedPublicationStatus.CANCELLED],
      AWAITING_MANUAL_SUBMISSION: [NormalizedPublicationStatus.SUBMITTED, NormalizedPublicationStatus.ACTION_REQUIRED, NormalizedPublicationStatus.CANCELLED],
      SUBMITTED: [NormalizedPublicationStatus.PROCESSING, NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.FAILED],
      PROCESSING: [NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.ACTION_REQUIRED, NormalizedPublicationStatus.APPROVED, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.FAILED],
      IN_REVIEW: [NormalizedPublicationStatus.ACTION_REQUIRED, NormalizedPublicationStatus.APPROVED, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.PUBLISHING],
      ACTION_REQUIRED: [NormalizedPublicationStatus.PROCESSING, NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.BLOCKED],
      APPROVED: [NormalizedPublicationStatus.PUBLISHING, NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.REJECTED],
      PUBLISHING: [NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.FAILED],
      LIVE: [NormalizedPublicationStatus.UNPUBLISHED, NormalizedPublicationStatus.REMOVED, NormalizedPublicationStatus.PARTIALLY_LIVE],
      PARTIALLY_LIVE: [NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.UNPUBLISHED, NormalizedPublicationStatus.REMOVED],
      BLOCKED: [NormalizedPublicationStatus.PROCESSING, NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.FAILED, NormalizedPublicationStatus.CANCELLED],
      REJECTED: [],
      FAILED: [NormalizedPublicationStatus.PROCESSING],
      UNPUBLISHED: [NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.REMOVED],
      REMOVED: [],
      CANCELLED: [],
      UNKNOWN: [NormalizedPublicationStatus.DRAFT, NormalizedPublicationStatus.READY_FOR_SUBMISSION, NormalizedPublicationStatus.SUBMITTED, NormalizedPublicationStatus.PROCESSING, NormalizedPublicationStatus.IN_REVIEW, NormalizedPublicationStatus.ACTION_REQUIRED, NormalizedPublicationStatus.APPROVED, NormalizedPublicationStatus.PUBLISHING, NormalizedPublicationStatus.LIVE, NormalizedPublicationStatus.REJECTED, NormalizedPublicationStatus.FAILED, NormalizedPublicationStatus.CANCELLED],
    };
    if (publicationStatusSyncDefaultPolicy.protectedTerminalStatuses.includes(previous) && !allowed[previous].includes(next)) throw new BadRequestException(`Protected terminal status ${previous} cannot transition to ${next}`);
    if (!allowed[previous].includes(next)) throw new BadRequestException(`Invalid publication status transition from ${previous} to ${next}`);
  }
}
