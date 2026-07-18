import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AnalyticsQueryDto, AnalyticsRefreshDto, AnalyticsRefreshQueryDto, AnalyticsSnapshotQueryDto } from './dto';
import { AnalyticsScope } from './entities/book-analytics.entity';
import { BookAnalyticsService } from './book-analytics.service';

@ApiTags('Book Analytics') @ApiBearerAuth() @Controller('book-analytics') @UseGuards(JwtAuthGuard, RolesGuard)
export class BookAnalyticsController {
  constructor(private readonly service: BookAnalyticsService) {}
  @Get('books/:bookId/summary') bookSummary(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookSummary(bookId, query); }
  @Get('books/:bookId/sales') bookSales(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookSales(bookId, query); }
  @Get('books/:bookId/royalties') bookRoyalty(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookRoyalty(bookId, query); }
  @Get('books/:bookId/comparison') bookComparison(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookComparison(bookId, query); }
  @Get('books/:bookId/trend') bookTrend(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookTrend(bookId, query); }
  @Get('books/:bookId/provider-breakdown') bookProvider(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookBreakdown(bookId, 'provider', query); }
  @Get('books/:bookId/marketplace-breakdown') bookMarketplace(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookBreakdown(bookId, 'marketplace', query); }
  @Get('books/:bookId/geographic-breakdown') bookGeo(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookBreakdown(bookId, 'country', query); }
  @Get('books/:bookId/format-breakdown') bookFormat(@Param('bookId') bookId: string, @Query() query: AnalyticsQueryDto) { return this.service.bookBreakdown(bookId, 'format', query); }
  @Get('editions/:editionId') edition(@Param('editionId') editionId: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.EDITION, editionId, query); }
  @Get('authors/:authorId') author(@Param('authorId') authorId: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.AUTHOR, authorId, query); }
  @Get('series/:seriesId') series(@Param('seriesId') seriesId: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.SERIES, seriesId, query); }
  @Get('providers/:providerKey') provider(@Param('providerKey') providerKey: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.PROVIDER, providerKey, { ...query, providerKey }); }
  @Get('marketplaces/:marketplaceId') marketplace(@Param('marketplaceId') marketplaceId: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.MARKETPLACE, marketplaceId, { ...query, marketplaceId }); }
  @Get('countries/:countryCode') country(@Param('countryCode') countryCode: string, @Query() query: AnalyticsQueryDto) { return this.service.scoped(AnalyticsScope.COUNTRY, countryCode, { ...query, countryCode }); }
  @Get('projects/:projectId') project(@Param('projectId') projectId: string, @Query() query: AnalyticsQueryDto) { return this.service.project(projectId, query); }
  @Get('portfolio') portfolio(@Query() query: AnalyticsQueryDto) { return this.service.portfolio(query); }
  @Get('snapshots/current') currentSnapshot(@Query('scope') scope: AnalyticsScope, @Query('entityId') entityId: string | null, @Query('currency') currency = 'USD') { return this.service.currentSnapshot(scope, entityId, currency); }
  @Get('snapshots') snapshots(@Query() query: AnalyticsSnapshotQueryDto) { return this.service.listSnapshots(query); }
  @Post('refresh/incremental') @Roles(UserRole.ADMIN, UserRole.EDITOR) incremental(@Body() dto: AnalyticsRefreshDto, @CurrentUser('id') userId: string) { return this.service.incremental(dto, userId); }
  @Post('refresh/rebuild') @Roles(UserRole.ADMIN, UserRole.EDITOR) rebuild(@Body() dto: AnalyticsRefreshDto, @CurrentUser('id') userId: string) { return this.service.rebuild(dto, userId); }
  @Get('refresh/:id') refreshStatus(@Param('id') id: string) { return this.service.refreshStatus(id); }
  @Get('refresh') refreshes(@Query() query: AnalyticsRefreshQueryDto) { return this.service.listRefreshes(query); }
  @Post('refresh/:id/cancel') @Roles(UserRole.ADMIN, UserRole.EDITOR) cancel(@Param('id') id: string) { return this.service.cancelRefresh(id); }
  @Post('refresh/:id/retry') @Roles(UserRole.ADMIN, UserRole.EDITOR) retry(@Param('id') id: string) { return this.service.retryFailed(id); }
  @Delete('refresh/:id') @Roles(UserRole.ADMIN) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDeleteRefresh(id, userId); return { success: true }; }
  @Post('refresh/:id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restoreRefresh(id); }
}
