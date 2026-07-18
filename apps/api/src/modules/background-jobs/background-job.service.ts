import { Injectable, NotFoundException } from '@nestjs/common';
import { JobCancellationService } from './background-job-cancellation.service';
import { JobDispatcher } from './background-job-dispatcher';
import { JobExecutionRepository } from './background-job.repository';
import { JobScheduler } from './background-job-scheduler';
import type { CancelJobDto, TriggerJobDto, UpsertJobScheduleDto } from './dto/background-job.dto';
import { JobExecutionStatus } from './entities/background-job.entity';

@Injectable()
export class BackgroundJobService {
  constructor(private readonly dispatcher: JobDispatcher, private readonly executions: JobExecutionRepository, private readonly cancellation: JobCancellationService, private readonly scheduler: JobScheduler) {}
  trigger(dto: TriggerJobDto, userId?: string) { return this.dispatcher.dispatch({ ...dto, payload: dto.payload ?? {}, scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined, createdBy: userId }); }
  async retry(executionId: string, userId?: string) { const execution = await this.executions.findById(executionId); if (!execution) throw new NotFoundException('Job execution not found'); return this.dispatcher.dispatch({ jobKey: execution.jobKey, payload: execution.payload, tenantId: execution.tenantId ?? undefined, workspaceId: execution.workspaceId ?? undefined, projectId: execution.projectId ?? undefined, providerKey: execution.providerKey ?? undefined, marketplaceKey: execution.marketplaceKey ?? undefined, entityType: execution.entityType ?? undefined, entityId: execution.entityId ?? undefined, parentExecutionId: execution.executionId, correlationId: execution.correlationId ?? undefined, createdBy: userId }); }
  cancel(executionId: string, dto: CancelJobDto, userId?: string) { return this.cancellation.cancel(executionId, dto.reason, userId); }
  pause(executionId: string, userId?: string) { return this.executions.update(executionId, { status: JobExecutionStatus.PAUSED, updatedBy: userId ?? null }); }
  resume(executionId: string, userId?: string) { return this.executions.update(executionId, { status: JobExecutionStatus.QUEUED, updatedBy: userId ?? null }); }
  upsertSchedule(dto: UpsertJobScheduleDto, userId?: string) { return this.scheduler.upsert(dto, userId); }
  enableSchedule(scheduleId: string, enabled: boolean, userId?: string) { return this.scheduler.enable(scheduleId, enabled, userId); }
  triggerDueSchedules() { return this.scheduler.triggerDue(); }
}
