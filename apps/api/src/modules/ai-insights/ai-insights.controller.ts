import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GenerateInsightsDto, InsightQueryDto, InsightRefreshDto, InsightRefreshQueryDto } from './dto';
import { InsightScope } from './entities/ai-insight.entity';
import { AIInsightsService } from './ai-insights.service';

@ApiTags('AI Insights') @ApiBearerAuth() @Controller('ai-insights') @UseGuards(JwtAuthGuard, RolesGuard)
export class AIInsightsController {
  constructor(private readonly service: AIInsightsService) {}
  @Get('executive-summary') executive(@Query('projectId') projectId?: string) { return this.service.executiveSummary(projectId); }
  @Get('portfolio') portfolio(@Query() query: InsightQueryDto) { return this.service.portfolio(query); }
  @Get('projects/:projectId') project(@Param('projectId') projectId: string, @Query() query: InsightQueryDto) { return this.service.project(projectId, query); }
  @Get('books/:bookId') book(@Param('bookId') bookId: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.BOOK, bookId, query); }
  @Get('editions/:editionId') edition(@Param('editionId') editionId: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.EDITION, editionId, query); }
  @Get('providers/:providerKey') provider(@Param('providerKey') providerKey: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.PROVIDER, providerKey, query); }
  @Get('marketplaces/:marketplaceId') marketplace(@Param('marketplaceId') marketplaceId: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.MARKETPLACE, marketplaceId, query); }
  @Get('countries/:countryCode') country(@Param('countryCode') countryCode: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.COUNTRY, countryCode, query); }
  @Get('authors/:authorId') author(@Param('authorId') authorId: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.AUTHOR, authorId, query); }
  @Get('series/:seriesId') series(@Param('seriesId') seriesId: string, @Query() query: InsightQueryDto) { return this.service.scoped(InsightScope.SERIES, seriesId, query); }
  @Get('risk') risk(@Query('projectId') projectId?: string) { return this.service.risk(projectId); }
  @Get('opportunity-explanations') opportunity(@Query('projectId') projectId?: string) { return this.service.opportunityExplanations(projectId); }
  @Post('generate') @Roles(UserRole.ADMIN, UserRole.EDITOR) generate(@Body() dto: GenerateInsightsDto, @CurrentUser('id') userId: string) { return this.service.generate(dto, userId); }
  @Post('refresh') @Roles(UserRole.ADMIN, UserRole.EDITOR) refresh(@Body() dto: InsightRefreshDto, @CurrentUser('id') userId: string) { return this.service.refresh(dto, userId); }
  @Post('rebuild') @Roles(UserRole.ADMIN, UserRole.EDITOR) rebuild(@Body() dto: InsightRefreshDto, @CurrentUser('id') userId: string) { return this.service.rebuild(dto, userId); }
  @Get('refresh/:id') refreshStatus(@Param('id') id: string) { return this.service.refreshStatus(id); }
  @Get('refresh') listRefreshes(@Query() query: InsightRefreshQueryDto) { return this.service.listRefreshes(query); }
  @Get('search') search(@Query() query: InsightQueryDto) { return this.service.search(query); }
  @Post(':id/acknowledge') @Roles(UserRole.ADMIN, UserRole.EDITOR) acknowledge(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.acknowledge(id, userId); }
  @Post(':id/dismiss') @Roles(UserRole.ADMIN, UserRole.EDITOR) dismiss(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.dismiss(id, userId); }
  @Get('snapshots/current') currentSnapshot(@Query('scope') scope: InsightScope, @Query('entityId') entityId?: string) { return this.service.currentSnapshot(scope, entityId); }
}
