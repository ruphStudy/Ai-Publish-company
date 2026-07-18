import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Draft2DigitalManualSubmissionService } from './draft2digital.service';
import { Draft2DigitalQueryDto, PrepareDraft2DigitalPackageDto, RecordDraft2DigitalSubmissionDto, UpdateDraft2DigitalChecklistItemDto, UpdateDraft2DigitalStatusDto } from './dto';

@ApiTags('Draft2Digital') @ApiBearerAuth() @Controller('publishing-providers/draft2digital') @UseGuards(JwtAuthGuard, RolesGuard)
export class Draft2DigitalController {
  constructor(private readonly service: Draft2DigitalManualSubmissionService) {}
  @Post('packages/prepare') @Roles(UserRole.ADMIN, UserRole.EDITOR) prepare(@Body() dto: PrepareDraft2DigitalPackageDto, @CurrentUser('id') userId: string) { return this.service.prepare({ ...dto, createdBy: userId }); }
  @Get('packages') search(@Query() query: Draft2DigitalQueryDto) { return this.service.search(query); }
  @Get('packages/:id') one(@Param('id') id: string) { return this.service.findById(id); }
  @Get('targets/:targetExecutionId/latest') latest(@Param('targetExecutionId') id: string) { return this.service.latest(id); }
  @Get('packages/:id/checklist') checklist(@Param('id') id: string) { return this.service.checklist(id); }
  @Patch('packages/:id/checklist') @Roles(UserRole.ADMIN, UserRole.EDITOR) updateChecklist(@Param('id') id: string, @Body() dto: UpdateDraft2DigitalChecklistItemDto) { return this.service.updateChecklistItem(id, dto); }
  @Post('packages/:id/manual-submission') @Roles(UserRole.ADMIN, UserRole.EDITOR) recordSubmission(@Param('id') id: string, @Body() dto: RecordDraft2DigitalSubmissionDto, @CurrentUser('id') userId: string) { return this.service.recordSubmission(id, dto, userId); }
  @Patch('packages/:id/status') @Roles(UserRole.ADMIN, UserRole.EDITOR) updateStatus(@Param('id') id: string, @Body() dto: UpdateDraft2DigitalStatusDto, @CurrentUser('id') userId: string) { return this.service.updateStatus(id, dto, userId); }
  @Get('packages/:id/status-history') history(@Param('id') id: string) { return this.service.history(id); }
  @Delete('packages/:id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post('packages/:id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
