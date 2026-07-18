import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ImportRoyaltiesDto, RoyaltyImportQueryDto, SyncRoyaltiesDto, UploadRoyaltyFileDto } from './dto';
import { RoyaltyIngestionService } from './royalty-ingestion.service';

@ApiTags('Royalty Ingestion') @ApiBearerAuth() @Controller('royalty-ingestion') @UseGuards(JwtAuthGuard, RolesGuard)
export class RoyaltyIngestionController {
  constructor(private readonly service: RoyaltyIngestionService) {}
  @Post('imports') @Roles(UserRole.ADMIN, UserRole.EDITOR) import(@Body() dto: ImportRoyaltiesDto, @CurrentUser('id') userId: string) { return this.service.import(dto, userId); }
  @Post('imports/csv') @Roles(UserRole.ADMIN, UserRole.EDITOR) uploadCsv(@Body() dto: UploadRoyaltyFileDto, @CurrentUser('id') userId: string) { return this.service.uploadCsv(dto, userId); }
  @Post('imports/excel') @Roles(UserRole.ADMIN, UserRole.EDITOR) uploadExcel(@Body() dto: UploadRoyaltyFileDto, @CurrentUser('id') userId: string) { return this.service.uploadExcel(dto, userId); }
  @Post('sync/provider') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProvider(@Body() dto: SyncRoyaltiesDto) { return this.service.syncProvider(dto); }
  @Post('sync/project/:projectId') @Roles(UserRole.ADMIN, UserRole.EDITOR) syncProject(@Param('projectId') projectId: string, @Body() dto: SyncRoyaltiesDto) { return this.service.syncProject(projectId, dto); }
  @Get('imports') list(@Query() query: RoyaltyImportQueryDto) { return this.service.search(query); }
  @Get('imports/:importId') history(@Param('importId') importId: string) { return this.service.findByImportId(importId); }
  @Get('imports/:importId/status') status(@Param('importId') importId: string) { return this.service.status(importId); }
}
