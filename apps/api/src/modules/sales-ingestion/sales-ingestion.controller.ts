import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ImportSalesDto, SalesImportQueryDto, SyncSalesDto, UploadSalesFileDto } from './dto';
import { SalesIngestionService } from './sales-ingestion.service';

@ApiTags('Sales Ingestion') @ApiBearerAuth() @Controller('sales-ingestion') @UseGuards(JwtAuthGuard, RolesGuard)
export class SalesIngestionController {
  constructor(private readonly service: SalesIngestionService) {}
  @Post('imports') @Roles(UserRole.ADMIN, UserRole.EDITOR) import(@Body() dto: ImportSalesDto, @CurrentUser('id') userId: string) { return this.service.import(dto, userId); }
  @Post('imports/csv') @Roles(UserRole.ADMIN, UserRole.EDITOR) uploadCsv(@Body() dto: UploadSalesFileDto, @CurrentUser('id') userId: string) { return this.service.uploadCsv(dto, userId); }
  @Post('imports/excel') @Roles(UserRole.ADMIN, UserRole.EDITOR) uploadExcel(@Body() dto: UploadSalesFileDto, @CurrentUser('id') userId: string) { return this.service.uploadExcel(dto, userId); }
  @Post('sync/provider') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProvider(@Body() dto: SyncSalesDto) { return this.service.syncProvider(dto); }
  @Post('sync/project/:projectId') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProject(@Param('projectId') projectId: string, @Body() dto: SyncSalesDto) { return this.service.syncProject(projectId, dto); }
  @Get('imports') list(@Query() query: SalesImportQueryDto) { return this.service.search(query); }
  @Get('imports/:importId') history(@Param('importId') importId: string) { return this.service.findByImportId(importId); }
  @Get('imports/:importId/status') status(@Param('importId') importId: string) { return this.service.status(importId); }
}
