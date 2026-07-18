import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OpportunityActionDto, OpportunityQueryDto, OpportunityRefreshDto, OpportunityRefreshQueryDto } from './dto';
import { OpportunityScope, OpportunityStatus } from './entities/opportunity-analytics.entity';
import { OpportunityAnalyticsService } from './opportunity-analytics.service';

@ApiTags('Opportunity Analytics') @ApiBearerAuth() @Controller('opportunity-analytics') @UseGuards(JwtAuthGuard, RolesGuard)
export class OpportunityAnalyticsController {
  constructor(private readonly service: OpportunityAnalyticsService) {}
  @Get('projects/:projectId') project(@Param('projectId') projectId: string, @Query() query: OpportunityQueryDto) { return this.service.project(projectId, query); }
  @Get('portfolio') portfolio(@Query() query: OpportunityQueryDto) { return this.service.portfolio(query); }
  @Get('books/:bookId') book(@Param('bookId') bookId: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.BOOK, bookId, query); }
  @Get('editions/:editionId') edition(@Param('editionId') editionId: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.EDITION, editionId, query); }
  @Get('providers/:providerKey') provider(@Param('providerKey') providerKey: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.PROVIDER, providerKey, { ...query, providerKey }); }
  @Get('marketplaces/:marketplaceId') marketplace(@Param('marketplaceId') marketplaceId: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.MARKETPLACE, marketplaceId, { ...query, marketplaceId }); }
  @Get('countries/:countryCode') country(@Param('countryCode') countryCode: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.COUNTRY, countryCode, { ...query, countryCode }); }
  @Get('formats/:format') format(@Param('format') format: string, @Query() query: OpportunityQueryDto) { return this.service.scoped(OpportunityScope.FORMAT, format, { ...query, format }); }
  @Get('top') top(@Query() query: OpportunityQueryDto) { return this.service.top(query); }
  @Get('summaries') summaries(@Query('projectId') projectId?: string) { return this.service.summaries(projectId); }
  @Get('search') search(@Query() query: OpportunityQueryDto) { return this.service.search(query); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Get(':id/evidence') evidence(@Param('id') id: string) { return this.service.evidence(id); }
  @Post('refresh/incremental') @Roles(UserRole.ADMIN, UserRole.EDITOR) incremental(@Body() dto: OpportunityRefreshDto, @CurrentUser('id') userId: string) { return this.service.incremental(dto, userId); }
  @Post('refresh/rebuild') @Roles(UserRole.ADMIN, UserRole.EDITOR) rebuild(@Body() dto: OpportunityRefreshDto, @CurrentUser('id') userId: string) { return this.service.rebuild(dto, userId); }
  @Get('refresh/:id') refreshStatus(@Param('id') id: string) { return this.service.refreshStatus(id); }
  @Get('refresh') refreshes(@Query() query: OpportunityRefreshQueryDto) { return this.service.listRefreshes(query); }
  @Post('refresh/:id/cancel') @Roles(UserRole.ADMIN, UserRole.EDITOR) cancelRefresh(@Param('id') id: string) { return this.service.cancelRefresh(id); }
  @Post('refresh/:id/retry') @Roles(UserRole.ADMIN, UserRole.EDITOR) retryRefresh(@Param('id') id: string) { return this.service.retryFailedRefresh(id); }
  @Post(':id/accept') @Roles(UserRole.ADMIN, UserRole.EDITOR) accept(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.ACCEPTED, dto, userId); }
  @Post(':id/in-progress') @Roles(UserRole.ADMIN, UserRole.EDITOR) inProgress(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.IN_PROGRESS, dto, userId); }
  @Post(':id/snooze') @Roles(UserRole.ADMIN, UserRole.EDITOR) snooze(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.SNOOZED, dto, userId); }
  @Post(':id/dismiss') @Roles(UserRole.ADMIN, UserRole.EDITOR) dismiss(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.DISMISSED, dto, userId); }
  @Post(':id/resolve') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolve(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.RESOLVED, dto, userId); }
  @Post(':id/reopen') @Roles(UserRole.ADMIN, UserRole.EDITOR) reopen(@Param('id') id: string, @Body() dto: OpportunityActionDto, @CurrentUser('id') userId: string) { return this.service.transition(id, OpportunityStatus.ACTIVE, dto, userId); }
  @Post('preview') preview(@Body() dto: OpportunityRefreshDto) { return this.service.preview(dto); }
  @Get('snapshots/current') currentSnapshot(@Query('scope') scope: OpportunityScope, @Query('entityId') entityId?: string) { return this.service.currentSnapshot(scope, entityId); }
  @Get('snapshots') snapshots(@Query() query: OpportunityQueryDto) { return this.service.listSnapshots(query); }
  @Delete('refresh/:id') @Roles(UserRole.ADMIN) async removeRefresh(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDeleteRefresh(id, userId); return { success: true }; }
  @Post('refresh/:id/restore') @Roles(UserRole.ADMIN) restoreRefresh(@Param('id') id: string) { return this.service.restoreRefresh(id); }
}
