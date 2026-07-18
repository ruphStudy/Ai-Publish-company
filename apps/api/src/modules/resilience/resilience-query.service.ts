import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import type { CircuitQueryDto, RecoveryQueryDto } from './dto/resilience.dto';
import type { RecoveryEvent, RecoveryState, ResilienceCircuitState } from './entities/resilience.entity';
import { CircuitStateRepository, RecoveryEventRepository, RecoveryStateRepository } from './resilience.repository';
import { ResilienceRegistry } from './resilience.registry';
import { FailureDetector } from './failure-detector.service';

@Injectable()
export class ResilienceQueryService {
  constructor(private readonly registry: ResilienceRegistry, private readonly recoveries: RecoveryStateRepository, private readonly circuits: CircuitStateRepository, private readonly events: RecoveryEventRepository, private readonly detector: FailureDetector) {}
  policies() { return this.registry.all(); }
  recoveryStatus() { return this.detector.diagnostics(); }
  history(query: RecoveryQueryDto) { const filter: FilterQuery<RecoveryState> = {}; if (query.status) filter.status = query.status; if (query.failureCategory) filter.failureCategory = query.failureCategory; if (query.policyKey) filter.policyKey = query.policyKey; if (query.tenantId) filter.tenantId = query.tenantId; if (query.workspaceId) filter.workspaceId = query.workspaceId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.marketplaceKey) filter.marketplaceKey = query.marketplaceKey; return this.recoveries.paginate(filter, query.page, query.limit); }
  circuitsStatus(query: CircuitQueryDto) { const filter: FilterQuery<ResilienceCircuitState> = {}; if (query.policyKey) filter.policyKey = query.policyKey; if (query.isolationScope) filter.isolationScope = query.isolationScope; if (query.state) filter.state = query.state; return this.circuits.paginate(filter, query.page, query.limit); }
  eventsHistory(query: RecoveryQueryDto) { const filter: FilterQuery<RecoveryEvent> = {}; if (query.failureCategory) filter.failureCategory = query.failureCategory; if (query.tenantId) filter.tenantId = query.tenantId; if (query.workspaceId) filter.workspaceId = query.workspaceId; if (query.providerKey) filter.providerKey = query.providerKey; if (query.marketplaceKey) filter.marketplaceKey = query.marketplaceKey; return this.events.paginate(filter, query.page, query.limit); }
  failedOperations() { return this.detector.diagnostics(); }
}
