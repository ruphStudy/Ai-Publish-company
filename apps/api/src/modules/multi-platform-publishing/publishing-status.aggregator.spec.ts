import { MultiPlatformOrchestrationStatus, MultiPlatformPartialSuccessPolicy, MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';
import type { MultiPlatformTargetDocument } from './entities/multi-platform-target.entity';
import { PublishingStatusAggregator } from './publishing-status.aggregator';

describe('PublishingStatusAggregator', () => {
  const aggregator = new PublishingStatusAggregator();
  const target = (status: MultiPlatformTargetStatus, required = true) => ({ status, required }) as MultiPlatformTargetDocument;

  it('maps manual-submission targets to processing', () => {
    expect(aggregator.aggregate([target(MultiPlatformTargetStatus.READY_FOR_MANUAL_SUBMISSION)], MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL)).toBe(MultiPlatformOrchestrationStatus.PROCESSING);
  });

  it('recognizes completed and partially completed provider states', () => {
    expect(aggregator.aggregate([target(MultiPlatformTargetStatus.PUBLISHED), target(MultiPlatformTargetStatus.SUBMITTED, false)], MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL)).toBe(MultiPlatformOrchestrationStatus.COMPLETED);
    expect(aggregator.aggregate([target(MultiPlatformTargetStatus.PUBLISHED), target(MultiPlatformTargetStatus.FAILED, false)], MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL)).toBe(MultiPlatformOrchestrationStatus.PARTIALLY_COMPLETED);
  });

  it('blocks empty or explicitly blocked execution sets', () => {
    expect(aggregator.aggregate([], MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL)).toBe(MultiPlatformOrchestrationStatus.BLOCKED);
    expect(aggregator.aggregate([target(MultiPlatformTargetStatus.BLOCKED)], MultiPlatformPartialSuccessPolicy.ALLOW_PARTIAL)).toBe(MultiPlatformOrchestrationStatus.BLOCKED);
  });
});
