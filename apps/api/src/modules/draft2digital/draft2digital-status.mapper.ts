import { Injectable } from '@nestjs/common';
import { PublishingTargetStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import { Draft2DigitalStatus } from './entities/draft2digital.entity';
@Injectable()
export class Draft2DigitalStatusMapper {
  toTargetStatus(status: Draft2DigitalStatus): PublishingTargetStatus { return ({ DRAFT: PublishingTargetStatus.PENDING, READY_FOR_SUBMISSION: PublishingTargetStatus.READY, SUBMISSION_RECORDED: PublishingTargetStatus.SUBMITTED, IN_REVIEW: PublishingTargetStatus.PROCESSING, LIVE: PublishingTargetStatus.PUBLISHED, ACTION_REQUIRED: PublishingTargetStatus.REJECTED, BLOCKED: PublishingTargetStatus.FAILED, REJECTED: PublishingTargetStatus.REJECTED, UNKNOWN: PublishingTargetStatus.PROCESSING })[status]; }
}
