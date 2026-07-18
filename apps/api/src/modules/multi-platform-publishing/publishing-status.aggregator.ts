import { Injectable } from '@nestjs/common';
import { MultiPlatformOrchestrationStatus, MultiPlatformPartialSuccessPolicy, MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';
import type { MultiPlatformTargetDocument } from './entities/multi-platform-target.entity';

@Injectable()
export class PublishingStatusAggregator {
  aggregate(targets: MultiPlatformTargetDocument[], policy: MultiPlatformPartialSuccessPolicy): MultiPlatformOrchestrationStatus {
    if (!targets.length) return MultiPlatformOrchestrationStatus.BLOCKED;
    if (targets.every((target) => target.status === MultiPlatformTargetStatus.CANCELLED)) return MultiPlatformOrchestrationStatus.CANCELLED;
    if (targets.every((target) => target.status === MultiPlatformTargetStatus.PUBLISHED || target.status === MultiPlatformTargetStatus.SUBMITTED || target.status === MultiPlatformTargetStatus.READY_FOR_MANUAL_SUBMISSION)) return targets.some((target) => target.status === MultiPlatformTargetStatus.READY_FOR_MANUAL_SUBMISSION) ? MultiPlatformOrchestrationStatus.PROCESSING : MultiPlatformOrchestrationStatus.COMPLETED;
    if (targets.some((target) => target.status === MultiPlatformTargetStatus.PUBLISHED || target.status === MultiPlatformTargetStatus.SUBMITTED) && targets.some((target) => [MultiPlatformTargetStatus.FAILED, MultiPlatformTargetStatus.REJECTED, MultiPlatformTargetStatus.ACTION_REQUIRED].includes(target.status))) return MultiPlatformOrchestrationStatus.PARTIALLY_COMPLETED;
    if (targets.some((target) => target.required && [MultiPlatformTargetStatus.FAILED, MultiPlatformTargetStatus.REJECTED].includes(target.status))) return policy === MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL ? MultiPlatformOrchestrationStatus.PARTIALLY_COMPLETED : MultiPlatformOrchestrationStatus.FAILED;
    if (targets.some((target) => target.status === MultiPlatformTargetStatus.RETRY_PENDING)) return MultiPlatformOrchestrationStatus.RETRY_PENDING;
    if (targets.some((target) => target.status === MultiPlatformTargetStatus.BLOCKED)) return MultiPlatformOrchestrationStatus.BLOCKED;
    return MultiPlatformOrchestrationStatus.PROCESSING;
  }
}
