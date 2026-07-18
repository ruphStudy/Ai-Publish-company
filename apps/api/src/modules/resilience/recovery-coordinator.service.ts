import { Injectable, NotFoundException } from '@nestjs/common';
import { RecoveryEventType, RecoveryStatus } from './entities/resilience.entity';
import { RecoveryEventRepository, RecoveryStateRepository } from './resilience.repository';
import { ResilienceRegistry } from './resilience.registry';

@Injectable()
export class RecoveryCoordinator {
  constructor(private readonly registry: ResilienceRegistry, private readonly recoveries: RecoveryStateRepository, private readonly events: RecoveryEventRepository) {}

  async manualRetry(recoveryId: string, userId?: string) {
    const recovery = await this.recoveries.findById(recoveryId);
    if (!recovery) throw new NotFoundException('Recovery state not found');
    const updated = await this.recoveries.update(recoveryId, { status: RecoveryStatus.RETRYING, attemptCount: recovery.attemptCount + 1, updatedBy: userId ?? null });
    await this.events.create({ recoveryId, type: RecoveryEventType.RETRY_STARTED, failureCategory: recovery.failureCategory, tenantId: recovery.tenantId, workspaceId: recovery.workspaceId, providerKey: recovery.providerKey, marketplaceKey: recovery.marketplaceKey, correlationId: recovery.correlationId, metadata: { manual: true } });
    return updated;
  }

  async manualRecover(recoveryId: string, userId?: string) {
    const recovery = await this.recoveries.findById(recoveryId);
    if (!recovery) throw new NotFoundException('Recovery state not found');
    const handler = this.registry.handler(recovery.policyKey);
    await this.recoveries.update(recoveryId, { status: RecoveryStatus.RECOVERING, updatedBy: userId ?? null });
    const result = handler ? await handler.recover(recoveryId) : { manual: true };
    const updated = await this.recoveries.update(recoveryId, { status: RecoveryStatus.SUCCEEDED, recoveredAt: new Date(), safeContext: { ...recovery.safeContext, result } });
    await this.events.create({ recoveryId, type: RecoveryEventType.RECOVERY_COMPLETED, failureCategory: recovery.failureCategory, tenantId: recovery.tenantId, workspaceId: recovery.workspaceId, providerKey: recovery.providerKey, marketplaceKey: recovery.marketplaceKey, correlationId: recovery.correlationId, metadata: { manual: true } });
    return updated;
  }

  failedOperations() {
    return this.recoveries.failed();
  }
}
