import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreatePublicationReadinessDto, PublicationReadinessQueryDto, RejectPublicationReadinessDto } from './dto';
import { ReadinessTargetType } from './entities/publication-readiness.entity';
import { PublicationReadinessService } from './publication-readiness.service';

@ApiTags('Publication Readiness') @ApiBearerAuth() @Controller('publication-readiness') @UseGuards(JwtAuthGuard, RolesGuard)
export class PublicationReadinessController {
  constructor(private readonly service: PublicationReadinessService) {}
  @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) create(@Body() dto: CreatePublicationReadinessDto, @CurrentUser('id') userId: string) { return this.service.create({ ...dto, createdBy: userId }); }
  @Post(':id/process') @Roles(UserRole.ADMIN, UserRole.EDITOR) process(@Param('id') id: string) { return this.service.process(id); }
  @Post(':id/recalculate') @Roles(UserRole.ADMIN, UserRole.EDITOR) recalculate(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.recalculate(id, userId); }
  @Get() search(@Query() query: PublicationReadinessQueryDto) { return this.service.search(query); }
  @Get('project/:projectId') project(@Param('projectId') id: string) { return this.service.findByProjectId(id); }
  @Get('project/:projectId/latest') latest(@Param('projectId') id: string, @Query('manuscriptVersion') version?: string) { return this.service.latestAssessment(id, version); }
  @Get('target/:targetType/:targetId') target(@Param('targetType') type: ReadinessTargetType, @Param('targetId') id: string) { return this.service.findByTarget(type, id); }
  @Get(':id') one(@Param('id') id: string) { return this.service.findById(id); }
  @Patch(':id/approve') @Roles(UserRole.ADMIN, UserRole.EDITOR) approve(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.approve(id, userId); }
  @Patch(':id/reject') @Roles(UserRole.ADMIN, UserRole.EDITOR) reject(@Param('id') id: string, @Body() dto: RejectPublicationReadinessDto, @CurrentUser('id') userId: string) { return this.service.reject(id, dto, userId); }
  @Patch(':id/revoke-approval') @Roles(UserRole.ADMIN) revoke(@Param('id') id: string, @CurrentUser('id') userId: string) { return this.service.revokeApproval(id, userId); }
  @Delete(':id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
