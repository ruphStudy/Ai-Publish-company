import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JobDispatcher } from './background-job-dispatcher';
import { JobScheduleRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';
import { JobScheduleStatus, JobScheduleType } from './entities/background-job.entity';
import type { UpsertJobScheduleDto } from './dto/background-job.dto';

@Injectable()
export class JobScheduler {
  constructor(private readonly schedules: JobScheduleRepository, private readonly registry: JobRegistry, private readonly dispatcher: JobDispatcher) {}

  async upsert(dto: UpsertJobScheduleDto, userId?: string) {
    if (!this.registry.find(dto.jobKey)) throw new Error('Job definition is not registered');
    const nextRunAt = this.nextRun(dto.type, dto.runAt ? new Date(dto.runAt) : null, dto.intervalMs);
    return this.schedules.upsert(dto.scheduleId, { jobKey: dto.jobKey, name: dto.name, type: dto.type, status: JobScheduleStatus.ENABLED, cron: dto.cron ?? null, intervalMs: dto.intervalMs ?? null, runAt: dto.runAt ? new Date(dto.runAt) : null, timezone: dto.timezone ?? 'UTC', overlapPolicy: dto.overlapPolicy, payload: dto.payload ?? {}, tenantId: dto.tenantId ?? null, workspaceId: dto.workspaceId ?? null, providerKey: dto.providerKey ?? null, marketplaceKey: dto.marketplaceKey ?? null, nextRunAt, createdBy: userId ?? null, updatedBy: userId ?? null });
  }

  async enable(scheduleId: string, enabled: boolean, userId?: string) {
    return this.schedules.update(scheduleId, { status: enabled ? JobScheduleStatus.ENABLED : JobScheduleStatus.DISABLED, updatedBy: userId ?? null });
  }

  async triggerDue(limit = 50) {
    const due = await this.schedules.due(new Date(), limit);
    const executions = [];
    for (const schedule of due) {
      await this.schedules.update(schedule.scheduleId, { locked: true, lockedAt: new Date() });
      executions.push(await this.dispatcher.dispatch({ jobKey: schedule.jobKey, payload: schedule.payload, tenantId: schedule.tenantId ?? undefined, workspaceId: schedule.workspaceId ?? undefined, providerKey: schedule.providerKey ?? undefined, marketplaceKey: schedule.marketplaceKey ?? undefined, scheduleId: schedule.scheduleId, idempotencyKey: `${schedule.scheduleId}:${schedule.nextRunAt?.toISOString() ?? randomUUID()}`, scheduledAt: new Date(), correlationId: `SCH-${schedule.scheduleId}` }));
      await this.schedules.update(schedule.scheduleId, { locked: false, lockedAt: null, lastRunAt: new Date(), nextRunAt: schedule.type === JobScheduleType.INTERVAL && schedule.intervalMs ? new Date(Date.now() + schedule.intervalMs) : schedule.type === JobScheduleType.ONCE ? null : schedule.nextRunAt });
    }
    return executions;
  }

  private nextRun(type: JobScheduleType, runAt: Date | null, intervalMs?: number) {
    if (type === JobScheduleType.ONCE) return runAt ?? new Date();
    if (type === JobScheduleType.INTERVAL) return new Date(Date.now() + Math.max(intervalMs ?? 60000, 60000));
    return runAt ?? new Date(Date.now() + 60000);
  }
}
