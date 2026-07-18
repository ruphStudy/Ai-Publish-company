import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePublishingHistoryDto, PublishingAuditQueryDto, PublishingHistoryQueryDto } from './dto';
import { PublishingHistoryService } from './publishing-history.service';

@ApiTags('Publishing History') @ApiBearerAuth() @Controller('publishing-history') @UseGuards(JwtAuthGuard, RolesGuard)
export class PublishingHistoryController {
  constructor(private readonly service: PublishingHistoryService) {}
  @Get('projects/:projectId') project(@Param('projectId') projectId: string) { return this.service.projectHistory(projectId); }
  @Get('workflows/:workflowId') workflow(@Param('workflowId') workflowId: string) { return this.service.workflowHistory(workflowId); }
  @Get('orchestrations/:orchestrationId') orchestration(@Param('orchestrationId') orchestrationId: string) { return this.service.orchestrationHistory(orchestrationId); }
  @Get('providers/:providerKey') provider(@Param('providerKey') providerKey: string, @Query() query: PublishingHistoryQueryDto) { return this.service.providerHistory(providerKey, query); }
  @Get('targets/:targetExecutionId') target(@Param('targetExecutionId') targetExecutionId: string) { return this.service.targetHistory(targetExecutionId); }
  @Get('timeline') timeline(@Query() query: PublishingHistoryQueryDto) { return this.service.publicationTimeline(query); }
  @Get('search') search(@Query() query: PublishingHistoryQueryDto) { return this.service.searchHistory(query); }
  @Get('audit/search') @Roles(UserRole.ADMIN) audit(@Query() query: PublishingAuditQueryDto) { return this.service.searchAudit(query); }
  @Get('events') events() { return this.service.listEvents(); }
  @Get('audit') @Roles(UserRole.ADMIN) auditList(@Query() query: PublishingAuditQueryDto) { return this.service.listAuditRecords(query); }
  @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) record(@Body() dto: CreatePublishingHistoryDto, @CurrentUser('id') userId: string) { return this.service.record(dto, userId); }
}
