import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { SchedulerService } from './scheduler.service';
import {
  CreateSchedulerJobDto,
  UpdateSchedulerJobDto,
  SchedulerJobQueryDto,
  JobExecutionQueryDto,
  SchedulerJobResponseDto,
  JobExecutionResponseDto,
  PaginatedSchedulerJobResponseDto,
  PaginatedJobExecutionResponseDto,
  SchedulerHealthResponseDto,
  TriggerJobResponseDto,
} from './dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '../../auth/entities/user.entity';
import type { User } from '../../auth/entities/user.entity';

@ApiTags('market-intelligence/scheduler')
@Controller('market-intelligence/scheduler')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get scheduler health status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Scheduler health retrieved', type: SchedulerHealthResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getHealth(): Promise<SchedulerHealthResponseDto> {
    return this.schedulerService.getHealth();
  }

  @Post('jobs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Register a new scheduled job', description: 'Requires ADMIN role.' })
  @ApiBody({ type: CreateSchedulerJobDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Job registered successfully', type: SchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Job name already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async registerJob(
    @Body() dto: CreateSchedulerJobDto,
    @CurrentUser() user: User,
  ): Promise<SchedulerJobResponseDto> {
    return this.schedulerService.registerJob(dto, user.id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List all registered scheduler jobs' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Jobs retrieved successfully', type: PaginatedSchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async listJobs(@Query() query: SchedulerJobQueryDto): Promise<PaginatedSchedulerJobResponseDto> {
    return this.schedulerService.listJobs(query);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get a scheduler job by ID' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job retrieved successfully', type: SchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getJob(@Param('id') id: string): Promise<SchedulerJobResponseDto> {
    return this.schedulerService.getJob(id);
  }

  @Patch('jobs/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a scheduler job', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateSchedulerJobDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job updated successfully', type: SchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Job name already exists' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async updateJob(
    @Param('id') id: string,
    @Body() dto: UpdateSchedulerJobDto,
    @CurrentUser() user: User,
  ): Promise<SchedulerJobResponseDto> {
    return this.schedulerService.updateJob(id, dto, user.id);
  }

  @Post('jobs/:id/enable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Enable a scheduler job', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job enabled successfully', type: SchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async enableJob(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<SchedulerJobResponseDto> {
    return this.schedulerService.enableJob(id, user.id);
  }

  @Post('jobs/:id/disable')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Disable a scheduler job', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job disabled successfully', type: SchedulerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async disableJob(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<SchedulerJobResponseDto> {
    return this.schedulerService.disableJob(id, user.id);
  }

  @Post('jobs/:id/trigger')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Manually trigger a scheduler job', description: 'Requires ADMIN role. Prevents duplicate execution.' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Job triggered successfully', type: TriggerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Job is already running' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Job is disabled' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async triggerJob(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<TriggerJobResponseDto> {
    return this.schedulerService.triggerJob(id, user.id);
  }

  @Delete('jobs/:id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a scheduler job (soft delete)', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Job deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async deleteJob(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.schedulerService.deleteJob(id, user.id);
  }

  @Get('jobs/:id/executions')
  @ApiOperation({ summary: 'Get execution history for a scheduler job' })
  @ApiParam({ name: 'id', description: 'Scheduler job ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Execution history retrieved', type: PaginatedJobExecutionResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async getExecutionHistory(
    @Param('id') id: string,
    @Query() query: JobExecutionQueryDto,
  ): Promise<PaginatedJobExecutionResponseDto> {
    return this.schedulerService.getExecutionHistory(id, query);
  }

  @Post('executions/:id/retry')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Retry a failed execution', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Execution ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Retry queued successfully', type: TriggerJobResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Execution not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Execution is not in FAILED status or max retries exceeded' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async retryExecution(@Param('id') id: string): Promise<TriggerJobResponseDto> {
    return this.schedulerService.retryExecution(id);
  }

  @Post('executions/:id/cancel')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancel a pending or running execution', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Execution ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Execution cancelled successfully', type: JobExecutionResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Execution not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Execution is not cancellable' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async cancelExecution(@Param('id') id: string): Promise<JobExecutionResponseDto> {
    return this.schedulerService.cancelExecution(id);
  }
}
