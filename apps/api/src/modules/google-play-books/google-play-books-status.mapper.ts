import { Injectable } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { GooglePlayBooksStatus } from './entities/google-play-books.entity';
@Injectable()
export class GooglePlayBooksStatusMapper {
  toTargetStatus(status: GooglePlayBooksStatus): PublishingTargetStatus { return ({ DRAFT: PublishingTargetStatus.PENDING, READY_FOR_SUBMISSION: PublishingTargetStatus.READY, SUBMISSION_RECORDED: PublishingTargetStatus.SUBMITTED, PROCESSING: PublishingTargetStatus.PROCESSING, IN_REVIEW: PublishingTargetStatus.PROCESSING, PUBLISHING: PublishingTargetStatus.PROCESSING, LIVE: PublishingTargetStatus.PUBLISHED, ACTION_REQUIRED: PublishingTargetStatus.REJECTED, BLOCKED: PublishingTargetStatus.FAILED, REJECTED: PublishingTargetStatus.REJECTED, REMOVED: PublishingTargetStatus.CANCELLED, UNKNOWN: PublishingTargetStatus.PROCESSING })[status]; }
}
