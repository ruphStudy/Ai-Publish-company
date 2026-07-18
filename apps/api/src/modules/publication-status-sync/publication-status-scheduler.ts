import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

export const PUBLICATION_STATUS_SYNC_QUEUE = 'publication-status-sync';

@Injectable()
export class PublicationStatusScheduler {
  constructor(@InjectQueue(PUBLICATION_STATUS_SYNC_QUEUE) private readonly queue: Queue) {}
  async schedule(targetExecutionId: string, delay = 0, jobId = `publication-status-sync:${targetExecutionId}`): Promise<string> { const job = await this.queue.add('sync-target', { targetExecutionId }, { jobId, delay, removeOnComplete: true, removeOnFail: false }); return String(job.id); }
  async pause(): Promise<void> { await this.queue.pause(); }
  async resume(): Promise<void> { await this.queue.resume(); }
}
