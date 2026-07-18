import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ContentImprovementQueryDto, CreateContentImprovementDto } from './dto';
import { ImprovementTargetType } from './entities/content-improvement.entity';
import { ContentImprovementService } from './content-improvement.service';

@ApiTags('Content Improvement')
@ApiBearerAuth()
@Controller('content-improvements')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContentImprovementController {
  constructor(private readonly service: ContentImprovementService) {}
  @Post() @Roles(UserRole.ADMIN, UserRole.EDITOR) @ApiOperation({ summary: 'Create content improvement request' }) create(@Body() dto: CreateContentImprovementDto, @CurrentUser('id') userId: string) { return this.service.create({ ...dto, createdBy: userId }); }
  @Post(':id/process') @Roles(UserRole.ADMIN, UserRole.EDITOR) @ApiOperation({ summary: 'Process content improvement' }) process(@Param('id') id: string) { return this.service.process(id); }
  @Get() @ApiOperation({ summary: 'Search content improvements' }) search(@Query() query: ContentImprovementQueryDto) { return this.service.search(query); }
  @Get('project/:projectId') @ApiOperation({ summary: 'List project improvements' }) project(@Param('projectId') projectId: string) { return this.service.findByProjectId(projectId); }
  @Get('target/:targetType/:targetId') @ApiOperation({ summary: 'List target improvements' }) target(@Param('targetType') targetType: ImprovementTargetType, @Param('targetId') targetId: string) { return this.service.findByTarget(targetType, targetId); }
  @Get(':id') @ApiOperation({ summary: 'Get content improvement' }) findOne(@Param('id') id: string) { return this.service.findById(id); }
  @Patch(':id/approve') @Roles(UserRole.ADMIN, UserRole.EDITOR) approve(@Param('id') id: string) { return this.service.approve(id); }
  @Patch(':id/reject') @Roles(UserRole.ADMIN, UserRole.EDITOR) reject(@Param('id') id: string) { return this.service.reject(id); }
  @Post(':id/apply') @Roles(UserRole.ADMIN, UserRole.EDITOR) apply(@Param('id') id: string) { return this.service.apply(id); }
  @Delete(':id') @Roles(UserRole.ADMIN, UserRole.EDITOR) async remove(@Param('id') id: string, @CurrentUser('id') userId: string) { await this.service.softDelete(id, userId); return { success: true }; }
  @Post(':id/restore') @Roles(UserRole.ADMIN) restore(@Param('id') id: string) { return this.service.restore(id); }
}
