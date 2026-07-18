import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { BatchSyncPublicationStatusDto, ManualPublicationStatusDto, PublicationStatusSyncQueryDto, ReconcilePublicationStatusDto, ResolvePublicationStatusConflictDto, SyncPublicationStatusDto } from './dto';
import { PublicationStatusSyncService } from './publication-status-sync.service';

@ApiTags('Publication Status Sync') @ApiBearerAuth() @Controller('publication-status-sync') @UseGuards(JwtAuthGuard, RolesGuard)
export class PublicationStatusSyncController {
  constructor(private readonly service: PublicationStatusSyncService) {}
  @Post('targets/:targetExecutionId/sync') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncTarget(@Param('targetExecutionId') targetExecutionId: string, @Body() dto: Omit<SyncPublicationStatusDto, 'targetExecutionId'>, @CurrentUser('id') userId: string) { return this.service.syncTarget({ ...dto, targetExecutionId }, userId); }
  @Post('workflows/:workflowId/sync') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncWorkflow(@Param('workflowId') workflowId: string, @CurrentUser('id') userId: string) { return this.service.syncWorkflow(workflowId, userId); }
  @Post('orchestrations/:orchestrationId/sync') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncOrchestration(@Param('orchestrationId') orchestrationId: string, @CurrentUser('id') userId: string) { return this.service.syncOrchestration(orchestrationId, userId); }
  @Post('projects/:projectId/sync') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProject(@Param('projectId') projectId: string, @CurrentUser('id') userId: string) { return this.service.syncProject(projectId, userId); }
  @Post('providers/:providerKey/sync') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProvider(@Param('providerKey') providerKey: string, @CurrentUser('id') userId: string) { return this.service.syncProvider(providerKey, userId); }
  @Post('batch') @Roles(UserRole.ADMIN, UserRole.EDITOR) queueBatch(@Body() dto: BatchSyncPublicationStatusDto) { return this.service.queueBatch(dto); }
  @Get() list(@Query() query: PublicationStatusSyncQueryDto) { return this.service.search(query); }
  @Get(':id') get(@Param('id') id: string) { return this.service.findById(id); }
  @Get('targets/:targetExecutionId/latest') latest(@Param('targetExecutionId') targetExecutionId: string) { return this.service.latest(targetExecutionId); }
  @Get('targets/:targetExecutionId/status') targetStatus(@Param('targetExecutionId') targetExecutionId: string) { return this.service.unifiedTargetStatus(targetExecutionId); }
  @Get('workflows/:workflowId/status') workflowStatus(@Param('workflowId') workflowId: string) { return this.service.workflowStatus(workflowId); }
  @Get('orchestrations/:orchestrationId/status') orchestrationStatus(@Param('orchestrationId') orchestrationId: string) { return this.service.orchestrationStatus(orchestrationId); }
  @Get('projects/:projectId/summary') projectSummary(@Param('projectId') projectId: string) { return this.service.projectSummary(projectId); }
  @Get('targets/:targetExecutionId/history') targetHistory(@Param('targetExecutionId') targetExecutionId: string) { return this.service.historyForTarget(targetExecutionId); }
  @Post('targets/:targetExecutionId/manual') @Roles(UserRole.ADMIN, UserRole.EDITOR) manual(@Param('targetExecutionId') targetExecutionId: string, @Body() dto: ManualPublicationStatusDto, @CurrentUser('id') userId: string) { return this.service.manualUpdate(targetExecutionId, dto, userId); }
  @Post('targets/:targetExecutionId/corrections') @Roles(UserRole.ADMIN) correction(@Param('targetExecutionId') targetExecutionId: string, @Body() dto: ManualPublicationStatusDto, @CurrentUser('id') userId: string) { return this.service.privilegedCorrection(targetExecutionId, dto, userId); }
  @Patch(':id/conflict') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolveConflict(@Param('id') id: string, @Body() dto: ResolvePublicationStatusConflictDto, @CurrentUser('id') userId: string) { return this.service.resolveConflict(id, dto, userId); }
  @Post('targets/:targetExecutionId/pause') @Roles(UserRole.ADMIN, UserRole.EDITOR) pause(@Param('targetExecutionId') targetExecutionId: string, @CurrentUser('id') userId: string) { return this.service.pauseTarget(targetExecutionId, userId); }
  @Post('targets/:targetExecutionId/resume') @Roles(UserRole.ADMIN, UserRole.EDITOR) resume(@Param('targetExecutionId') targetExecutionId: string, @CurrentUser('id') userId: string) { return this.service.resumeTarget(targetExecutionId, userId); }
  @Post('reconcile') @Roles(UserRole.ADMIN) reconcile(@Body() dto: ReconcilePublicationStatusDto) { return this.service.reconcile(dto); }
  @Delete(':id') @Roles(UserRole.ADMIN) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
