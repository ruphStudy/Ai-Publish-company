import { Injectable } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { AmazonKdpStatus } from './entities/amazon-kdp.entity';
@Injectable()
export class AmazonKdpStatusMapper {
  toTargetStatus(status: AmazonKdpStatus): PublishingTargetStatus { return ({ DRAFT: PublishingTargetStatus.PENDING, READY_FOR_SUBMISSION: PublishingTargetStatus.READY, SUBMISSION_RECORDED: PublishingTargetStatus.SUBMITTED, IN_REVIEW: PublishingTargetStatus.PROCESSING, PUBLISHING: PublishingTargetStatus.PROCESSING, LIVE: PublishingTargetStatus.PUBLISHED, ACTION_REQUIRED: PublishingTargetStatus.REJECTED, BLOCKED: PublishingTargetStatus.FAILED, REJECTED: PublishingTargetStatus.REJECTED, UNPUBLISHED: PublishingTargetStatus.CANCELLED, UNKNOWN: PublishingTargetStatus.PROCESSING })[status]; }
}
