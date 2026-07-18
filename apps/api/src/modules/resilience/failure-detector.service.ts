import { Injectable } from '@nestjs/common';
import { CircuitState, RecoveryStatus } from './entities/resilience.entity';
import { CircuitStateRepository, RecoveryStateRepository } from './resilience.repository';

@Injectable()
export class FailureDetector {
  constructor(private readonly recoveries: RecoveryStateRepository, private readonly circuits: CircuitStateRepository) {}

  async diagnostics() {
    const [failed, openCircuits] = await Promise.all([
      this.recoveries.paginate({ status: { $in: [RecoveryStatus.FAILED, RecoveryStatus.EXHAUSTED, RecoveryStatus.MANUAL_REQUIRED] } }, 1, 10),
      this.circuits.paginate({ state: CircuitState.OPEN }, 1, 10),
    ]);
    return { failedOperations: failed.total, openCircuits: openCircuits.total, status: failed.total || openCircuits.total ? 'degraded' : 'healthy' };
  }
}
