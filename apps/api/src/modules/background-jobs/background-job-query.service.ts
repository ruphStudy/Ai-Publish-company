import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import type { JobExecution, JobSchedule } from './entities/background-job.entity';
import type { JobExecutionQueryDto, ScheduleQueryDto } from './dto/background-job.dto';
import { JobExecutionRepository, JobScheduleRepository } from './background-job.repository';
import { JobRegistry } from './background-job.registry';

@Injectable()
export class JobQueryService {
  constructor(private readonly registry: JobRegistry, private readonly executions: JobExecutionRepository, private readonly schedules: JobScheduleRepository) {}
  definitions() { return this.registry.all(); }
  executionsList(query: JobExecutionQueryDto) { const filter: FilterQuery<JobExecution> = {}; if (query.jobKey) filter.jobKey = query.jobKey; if (query.queue) filter.queue = query.queue; if (query.status) filter.status = query.status; if (query.tenantId) filter.tenantId = query.tenantId; if (query.workspaceId) filter.workspaceId = query.workspaceId; if (query.deadLetter !== undefined) filter.deadLetter = query.deadLetter; return this.executions.paginate(filter, query.page, query.limit); }
  execution(id: string) { return this.executions.findById(id); }
  schedulesList(query: ScheduleQueryDto) { const filter: FilterQuery<JobSchedule> = {}; if (query.jobKey) filter.jobKey = query.jobKey; if (query.status) filter.status = query.status; if (query.workspaceId) filter.workspaceId = query.workspaceId; return this.schedules.paginate(filter, query.page, query.limit); }
  health() { return { queue: 'background-jobs', status: 'healthy', workers: [{ status: 'ready' }], scheduler: { status: 'ready' } }; }
}
