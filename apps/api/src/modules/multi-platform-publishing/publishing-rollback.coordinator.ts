import { Injectable } from '@nestjs/common';
import { MultiPlatformTargetRepository } from './multi-platform-target.repository';
import { MultiPlatformTargetStatus } from './entities/multi-platform-publishing.entity';

@Injectable()
export class PublishingRollbackCoordinator {
  constructor(private readonly targets: MultiPlatformTargetRepository) {}
  async localRollback(orchestrationId: string): Promise<void> { const targets = await this.targets.findByOrchestrationId(orchestrationId); await Promise.all(targets.filter((target) => [MultiPlatformTargetStatus.PENDING, MultiPlatformTargetStatus.READY, MultiPlatformTargetStatus.QUEUED].includes(target.status)).map((target) => this.targets.update(String(target._id), { status: MultiPlatformTargetStatus.CANCELLED, cancelledAt: new Date() }))); }
}
