import { Injectable, NotFoundException } from '@nestjs/common';
import { JobExecutionStatus } from './entities/background-job.entity';
import { JobExecutionRepository } from './background-job.repository';

@Injectable()
export class JobCancellationService {
  constructor(private readonly executions: JobExecutionRepository) {}
  async cancel(executionId: string, reason?: string, userId?: string) { const execution = await this.executions.findById(executionId); if (!execution) throw new NotFoundException('Job execution not found'); const terminal = [JobExecutionStatus.SUCCEEDED, JobExecutionStatus.FAILED, JobExecutionStatus.CANCELLED, JobExecutionStatus.DEAD_LETTERED]; return this.executions.update(executionId, { cancellationRequested: true, cancellationReason: reason ?? null, updatedBy: userId ?? null, status: terminal.includes(execution.status) ? execution.status : JobExecutionStatus.CANCELLING }); }
  async requested(executionId: string) { const execution = await this.executions.findById(executionId); return Boolean(execution?.cancellationRequested); }
}
