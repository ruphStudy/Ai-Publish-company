import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CanonicalSearchDto, NormalizationQueryDto, NormalizeRequestDto, ResolveMappingDto } from './dto';
import { NormalizationScope } from './entities/sales-royalty-normalization.entity';
import { SalesRoyaltyNormalizationService } from './sales-royalty-normalization.service';

@ApiTags('Sales Royalty Normalization') @ApiBearerAuth() @Controller('sales-royalty-normalization') @UseGuards(JwtAuthGuard, RolesGuard)
export class SalesRoyaltyNormalizationController {
  constructor(private readonly service: SalesRoyaltyNormalizationService) {}
  @Post('sales/:sourceRecordId') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeSales(@Param('sourceRecordId') sourceRecordId: string, @Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize({ ...dto, sourceRecordId, scope: NormalizationScope.SALES }, userId); }
  @Post('royalties/:sourceRecordId') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeRoyalty(@Param('sourceRecordId') sourceRecordId: string, @Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize({ ...dto, sourceRecordId, scope: NormalizationScope.ROYALTY }, userId); }
  @Post('imports') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeImport(@Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize(dto, userId); }
  @Post('projects/:projectId') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeProject(@Param('projectId') projectId: string, @Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize({ ...dto, projectId }, userId); }
  @Post('providers/:providerKey') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeProvider(@Param('providerKey') providerKey: string, @Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize({ ...dto, providerKey }, userId); }
  @Post('date-range') @Roles(UserRole.ADMIN, UserRole.EDITOR) normalizeDateRange(@Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.normalize(dto, userId); }
  @Post('batch') @Roles(UserRole.ADMIN, UserRole.EDITOR) queueBatch(@Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.queueBatch(dto, userId); }
  @Get('batches/:id') getBatch(@Param('id') id: string) { return this.service.getBatch(id); }
  @Get('projects/:projectId/latest') latest(@Param('projectId') projectId: string) { return this.service.latest(projectId); }
  @Get('batches/:id/progress') progress(@Param('id') id: string) { return this.service.progress(id); }
  @Get('batches') listBatches(@Query() query: NormalizationQueryDto) { return this.service.listBatches(query); }
  @Get('batches/:id/results') listResults(@Param('id') id: string, @Query() query: NormalizationQueryDto) { return this.service.listResults(id, query); }
  @Get('mapping-required') mappingRequired() { return this.service.mappingRequired(); }
  @Get('conflicted') conflicted() { return this.service.conflicted(); }
  @Post('retry-failed') @Roles(UserRole.ADMIN, UserRole.EDITOR) retryFailed() { return this.service.retryFailed(); }
  @Post('batches/:id/resume') @Roles(UserRole.ADMIN, UserRole.EDITOR) resume(@Param('id') id: string) { return this.service.resume(id); }
  @Post('batches/:id/cancel') @Roles(UserRole.ADMIN, UserRole.EDITOR) cancel(@Param('id') id: string) { return this.service.cancel(id); }
  @Post('reprocess') @Roles(UserRole.ADMIN, UserRole.EDITOR) reprocess(@Body() dto: NormalizeRequestDto, @CurrentUser('id') userId: string) { return this.service.reprocess(dto, userId); }
  @Post('preview') preview(@Body() dto: NormalizeRequestDto) { return this.service.preview(dto); }
  @Post('book-mappings') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolveBook(@Body() dto: ResolveMappingDto) { return this.service.resolveBookMapping(dto); }
  @Post('edition-mappings') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolveEdition(@Body() dto: ResolveMappingDto) { return this.service.resolveEditionMapping(dto); }
  @Post('conflicts') @Roles(UserRole.ADMIN, UserRole.EDITOR) resolveConflict(@Body() dto: ResolveMappingDto) { return this.service.resolveConflict(dto); }
  @Get('canonical-sales/:id') getCanonicalSales(@Param('id') id: string) { return this.service.getCanonicalSales(id); }
  @Get('canonical-royalties/:id') getCanonicalRoyalty(@Param('id') id: string) { return this.service.getCanonicalRoyalty(id); }
  @Get('canonical-sales') searchSales(@Query() query: CanonicalSearchDto) { return this.service.searchSales(query); }
  @Get('canonical-royalties') searchRoyalties(@Query() query: CanonicalSearchDto) { return this.service.searchRoyalties(query); }
  @Delete('batches/:id') @Roles(UserRole.ADMIN) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post('batches/:id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
