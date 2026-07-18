import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BackgroundJobService } from './background-job.service';
import { JobQueryService } from './background-job-query.service';
import { CancelJobDto, JobExecutionQueryDto, ScheduleQueryDto, TriggerJobDto, UpsertJobScheduleDto } from './dto/background-job.dto';

@ApiTags('Background Jobs')
@ApiBearerAuth()
@Controller('background-jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BackgroundJobController {
  constructor(private readonly jobs: BackgroundJobService, private readonly queries: JobQueryService) {}

  @Get('definitions')
  definitions() { return this.queries.definitions(); }

  @Get('executions')
  executions(@Query() query: JobExecutionQueryDto) { return this.queries.executionsList(query); }

  @Get('executions/:id')
  execution(@Param('id') id: string) { return this.queries.execution(id); }

  @Get('executions/:id/progress')
  progress(@Param('id') id: string) { return this.queries.execution(id).then((execution) => ({ executionId: id, status: execution?.status, progress: execution?.progress ?? 0, checkpoint: execution?.checkpoint ?? {} })); }

  @Post('trigger')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  trigger(@Body() dto: TriggerJobDto, @CurrentUser('id') userId: string) { return this.jobs.trigger(dto, userId); }

  @Post('executions/:id/retry')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  retry(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.jobs.retry(id, userId); }

  @Post('executions/:id/cancel')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  cancel(@Param('id') id: string, @Body() dto: CancelJobDto, @CurrentUser('id') userId: string) { return this.jobs.cancel(id, dto, userId); }

  @Post('executions/:id/pause')
  @Roles(UserRole.ADMIN)
  pause(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.jobs.pause(id, userId); }

  @Post('executions/:id/resume')
  @Roles(UserRole.ADMIN)
  resume(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.jobs.resume(id, userId); }

  @Get('schedules')
  schedules(@Query() query: ScheduleQueryDto) { return this.queries.schedulesList(query); }

  @Post('schedules')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  upsertSchedule(@Body() dto: UpsertJobScheduleDto, @CurrentUser('id') userId: string) { return this.jobs.upsertSchedule(dto, userId); }

  @Patch('schedules/:id/enable')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  enableSchedule(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.jobs.enableSchedule(id, true, userId); }

  @Patch('schedules/:id/disable')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  disableSchedule(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.jobs.enableSchedule(id, false, userId); }

  @Post('schedules/trigger-due')
  @Roles(UserRole.ADMIN)
  triggerDueSchedules() { return this.jobs.triggerDueSchedules(); }

  @Get('health/queues')
  queueHealth() { return this.queries.health(); }

  @Get('health/workers')
  workerHealth() { return this.queries.health(); }
}
