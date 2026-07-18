import { Injectable } from '@nestjs/common';
import { SyncRoyaltiesDto } from './dto';
import { RoyaltyImportSource, RoyaltyImportTrigger, RoyaltyIngestionEventType, RoyaltyProviderCapability } from './entities/royalty-ingestion.entity';
import { RoyaltyIngestionEventPublisher } from './royalty-ingestion-event.publisher';
import { RoyaltyProviderResolver } from './royalty-provider.resolver';

@Injectable()
export class RoyaltySyncCoordinator {
  constructor(private readonly resolver: RoyaltyProviderResolver, private readonly events: RoyaltyIngestionEventPublisher) {}
  async sync(dto: SyncRoyaltiesDto) { this.resolver.resolve(dto.providerKey, dto.incremental ? RoyaltyProviderCapability.INCREMENTAL_SYNC : RoyaltyProviderCapability.FULL_SYNC); this.events.publish(RoyaltyIngestionEventType.SYNC_STARTED, { providerKey: dto.providerKey, projectId: dto.projectId, incremental: dto.incremental }); return { providerKey: dto.providerKey, projectId: dto.projectId ?? null, source: RoyaltyImportSource.PROVIDER_API, trigger: dto.incremental ? RoyaltyImportTrigger.INCREMENTAL : RoyaltyImportTrigger.FULL_SYNC, status: 'QUEUED' }; }
}
