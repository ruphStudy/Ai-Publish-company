import { Processor, WorkerHost } from '@nestjs/bullmq';
import type { Job } from 'bullmq';
import { PUBLICATION_STATUS_SYNC_QUEUE } from './publication-status-scheduler';
import { PublicationStatusSyncService } from './publication-status-sync.service';

@Processor(PUBLICATION_STATUS_SYNC_QUEUE)
export class PublicationStatusWorker extends WorkerHost {
  constructor(private readonly service: PublicationStatusSyncService) { super(); }
  async process(job: Job<{ targetExecutionId: string }>): Promise<unknown> { return this.service.syncTarget({ targetExecutionId: job.data.targetExecutionId }); }
}
