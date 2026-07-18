import { Injectable } from '@nestjs/common';
import { SyncPublicationStatusDto } from './dto';
import { PublicationStatusSyncService } from './publication-status-sync.service';

@Injectable()
export class PublicationStatusSyncOrchestrator {
  constructor(private readonly service: PublicationStatusSyncService) {}
  run(dto: SyncPublicationStatusDto, requestedBy?: string) { return this.service.syncTarget(dto, requestedBy); }
  reconcile(targetExecutionId: string) { return this.service.reconcile({ targetExecutionId, applySafeFixes: true }); }
}
