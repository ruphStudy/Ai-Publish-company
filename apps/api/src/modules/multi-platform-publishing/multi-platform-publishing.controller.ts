import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateMultiPlatformPublishingDto, MultiPlatformActionDto, MultiPlatformQueryDto, ResolveConflictDto } from './dto';
import { MultiPlatformPublishingService } from './multi-platform-publishing.service';

@ApiTags('Multi-Platform Publishing') @ApiBearerAuth() @Controller('multi-platform-publishing') @UseGuards(JwtAuthGuard, RolesGuard)
export class MultiPlatformPublishingController {
  constructor(private readonly service: MultiPlatformPublishingService) {}
  @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) create(@Body() dto: CreateMultiPlatformPublishingDto, @CurrentUser('id') userId: string) { return this.service.create(dto, dto.requestedBy ?? userId); }
  @Post(':id/validate') @Roles(UserRole.ADMIN, UserRole.EDITOR) validate(@Param('id') id: string) { return this.service.validate(id); }
  @Post(':id/queue') @Roles(UserRole.ADMIN, UserRole.EDITOR) queue(@Param('id') id: string) { return this.service.queue(id); }
  @Post(':id/start') @Roles(UserRole.ADMIN, UserRole.EDITOR) start(@Param('id') id: string) { return this.service.start(id); }
  @Post(':id/retry') @Roles(UserRole.ADMIN, UserRole.EDITOR) retry(@Param('id') id: string) { return this.service.retry(id); }
  @Post(':id/targets/:targetId/retry') @Roles(UserRole.ADMIN, UserRole.EDITOR) retryTarget(@Param('id') id: string, @Param('targetId') targetId: string) { return this.service.retryTarget(id, targetId); }
  @Post(':id/resume') @Roles(UserRole.ADMIN, UserRole.EDITOR) resume(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.resume(id, userId); }
  @Post(':id/cancel') @Roles(UserRole.ADMIN, UserRole.EDITOR) cancel(@Param('id') id: string, @Body() dto: MultiPlatformActionDto, @CurrentUser('id') userId: string) { return this.service.cancel(id, dto, userId); }
  @Patch(':id/conflicts') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolveConflict(@Param('id') id: string, @Body() dto: ResolveConflictDto, @CurrentUser('id') userId: string) { return this.service.resolveConflict(id, dto, userId); }
  @Get() search(@Query() query: MultiPlatformQueryDto) { return this.service.search(query); }
  @Get('project/:projectId') project(@Param('projectId') id: string) { return this.service.findByProjectId(id); }
  @Get('project/:projectId/latest') latest(@Param('projectId') id: string, @Query('manuscriptVersion') version?: string) { return this.service.latest(id, version); }
  @Get(':id/provider-format-matrix') matrix(@Param('id') id: string) { return this.service.matrix(id); }
  @Get(':id/dependency-graph') graph(@Param('id') id: string) { return this.service.graph(id); }
  @Get(':id/conflicts') conflicts(@Param('id') id: string) { return this.service.conflictsPreview(id); }
  @Get(':id/targets') targets(@Param('id') id: string) { return this.service.targetsFor(id); }
  @Get(':id/events') events(@Param('id') id: string) { return this.service.eventsFor(id); }
  @Get(':id') one(@Param('id') id: string) { return this.service.findById(id); }
  @Delete(':id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
