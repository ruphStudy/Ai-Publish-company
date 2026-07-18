import { Injectable } from '@nestjs/common';
import { MultiPlatformOrchestrationStatus, MultiPlatformPartialSuccessPolicy, MultiPlatformTargetStatus } from '../multi-platform-publishing/entities/multi-platform-publishing.entity';
import { PublishingStatusAggregator } from '../multi-platform-publishing/publishing-status.aggregator';
import { PublishingTargetStatus, PublishingWorkflowStatus } from '../publishing-workflow/entities/publishing-workflow.entity';
import type { PublishingTargetExecutionDocument } from '../publishing-workflow/entities/publishing-target-execution.entity';

@Injectable()
export class PublicationStatusAggregator {
  constructor(private readonly multiPlatformAggregator: PublishingStatusAggregator) {}
  workflowStatus(targets: PublishingTargetExecutionDocument[]): PublishingWorkflowStatus {
    if (!targets.length) return PublishingWorkflowStatus.BLOCKED;
    if (targets.every((target) => target.status === PublishingTargetStatus.PUBLISHED)) return PublishingWorkflowStatus.COMPLETED;
    if (targets.some((target) => target.status === PublishingTargetStatus.PUBLISHED) && targets.some((target) => [PublishingTargetStatus.FAILED, PublishingTargetStatus.REJECTED].includes(target.status))) return PublishingWorkflowStatus.PARTIALLY_COMPLETED;
    if (targets.some((target) => [PublishingTargetStatus.FAILED, PublishingTargetStatus.REJECTED].includes(target.status))) return PublishingWorkflowStatus.FAILED;
    if (targets.some((target) => target.status === PublishingTargetStatus.CANCELLED)) return PublishingWorkflowStatus.CANCELLED;
    return PublishingWorkflowStatus.PROCESSING;
  }
  orchestrationStatus(targets: Array<{ status: MultiPlatformTargetStatus; required: boolean }>): MultiPlatformOrchestrationStatus {
    return this.multiPlatformAggregator.aggregate(targets as never, MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL);
  }
}
