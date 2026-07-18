import { Injectable } from '@nestjs/common';
import { JobExecutionRepository } from './background-job.repository';

@Injectable()
export class JobCheckpointService {
  constructor(private readonly executions: JobExecutionRepository) {}
  update(executionId: string, checkpoint: Record<string, unknown>, progress?: number) { return this.executions.update(executionId, { checkpoint, ...(progress !== undefined ? { progress } : {}) }); }
}
