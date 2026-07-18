import { Injectable } from '@nestjs/common';
import { SyncSalesDto } from './dto';
import { SalesImportSource, SalesImportTrigger, SalesIngestionEventType, SalesProviderCapability } from './entities/sales-ingestion.entity';
import { SalesIngestionEventPublisher } from './sales-ingestion-event.publisher';
import { SalesProviderResolver } from './sales-provider.resolver';

@Injectable()
export class SalesSyncCoordinator {
  constructor(private readonly resolver: SalesProviderResolver, private readonly events: SalesIngestionEventPublisher) {}
  async sync(dto: SyncSalesDto) { this.resolver.resolve(dto.providerKey, dto.incremental ? SalesProviderCapability.INCREMENTAL_SYNC : SalesProviderCapability.FULL_SYNC); this.events.publish(SalesIngestionEventType.SYNC_STARTED, { providerKey: dto.providerKey, projectId: dto.projectId, incremental: dto.incremental }); return { providerKey: dto.providerKey, projectId: dto.projectId ?? null, source: SalesImportSource.PROVIDER_API, trigger: dto.incremental ? SalesImportTrigger.INCREMENTAL : SalesImportTrigger.FULL_SYNC, status: 'QUEUED' }; }
}
