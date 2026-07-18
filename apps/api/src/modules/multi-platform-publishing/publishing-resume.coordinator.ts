import { Injectable } from '@nestjs/common';
import { MultiPlatformTargetRepository } from './multi-platform-target.repository';
import { MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';

@Injectable()
export class PublishingResumeCoordinator {
  constructor(private readonly targets: MultiPlatformTargetRepository) {}
  async eligibleTargets(orchestrationId: string) { const targets = await this.targets.findByOrchestrationId(orchestrationId); return targets.filter((target) => ![MultiPlatformTargetStatus.PUBLISHED, MultiPlatformTargetStatus.SUBMITTED].includes(target.status)); }
}
