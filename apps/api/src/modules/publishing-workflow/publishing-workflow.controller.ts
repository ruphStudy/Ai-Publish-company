import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePublishingWorkflowDto, PublishingActionDto, PublishingWorkflowQueryDto } from './dto';
import { PublishingWorkflowService } from './publishing-workflow.service';

@ApiTags('Publishing Workflow') @ApiBearerAuth() @Controller('publishing-workflows') @UseGuards(JwtAuthGuard, RolesGuard)
export class PublishingWorkflowController {
  constructor(private readonly service: PublishingWorkflowService) {}
  @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) create(@Body() dto: CreatePublishingWorkflowDto, @CurrentUser('id') userId: string) { return this.service.create(dto, dto.requestedBy ?? userId); }
  @Post(':id/validate') @Roles(UserRole.ADMIN, UserRole.EDITOR) validate(@Param('id') id: string) { return this.service.validate(id); }
  @Post(':id/queue') @Roles(UserRole.ADMIN, UserRole.EDITOR) queue(@Param('id') id: string) { return this.service.queue(id); }
  @Post(':id/start') @Roles(UserRole.ADMIN, UserRole.EDITOR) start(@Param('id') id: string) { return this.service.start(id); }
  @Post(':id/retry') @Roles(UserRole.ADMIN, UserRole.EDITOR) retry(@Param('id') id: string) { return this.service.retry(id); }
  @Post(':id/cancel') @Roles(UserRole.ADMIN, UserRole.EDITOR) cancel(@Param('id') id: string, @Body() dto: PublishingActionDto, @CurrentUser('id') userId: string) { return this.service.cancel(id, dto, userId); }
  @Post(':id/resume') @Roles(UserRole.ADMIN, UserRole.EDITOR) resume(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.resume(id, userId); }
  @Get() search(@Query() query: PublishingWorkflowQueryDto) { return this.service.search(query); }
  @Get('project/:projectId') project(@Param('projectId') id: string) { return this.service.findByProjectId(id); }
  @Get('project/:projectId/latest') latest(@Param('projectId') id: string, @Query('manuscriptVersion') version?: string) { return this.service.latest(id, version); }
  @Get(':id/targets') targets(@Param('id') id: string) { return this.service.listTargets(id); }
  @Get(':id/steps') steps(@Param('id') id: string) { return this.service.listSteps(id); }
  @Get(':id/events') events(@Param('id') id: string) { return this.service.listEvents(id); }
  @Get(':id') one(@Param('id') id: string) { return this.service.findById(id); }
  @Delete(':id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
