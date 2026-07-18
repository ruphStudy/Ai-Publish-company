import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateQualityReviewDto, QualityReviewQueryDto, UpdateQualityReviewDto } from './dto';
import { QualityReviewService } from './quality-review.service';

@ApiTags('Quality Review')
@ApiBearerAuth()
@Controller('quality-reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QualityReviewController {
  constructor(private readonly service: QualityReviewService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Review generated manuscript quality' })
  create(@Body() dto: CreateQualityReviewDto, @CurrentUser('id') userId: string) {
    return this.service.create({ ...dto, createdBy: userId });
  }

  @Get()
  @ApiOperation({ summary: 'Search and paginate quality reviews' })
  search(@Query() query: QualityReviewQueryDto) { return this.service.search(query); }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get quality reviews by project' })
  findByProject(@Param('projectId') projectId: string) { return this.service.findByProjectId(projectId); }

  @Get('project/:projectId/latest')
  @ApiOperation({ summary: 'Get latest project quality review' })
  latest(@Param('projectId') projectId: string) { return this.service.latestReview(projectId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get quality review by id' })
  findOne(@Param('id') id: string) { return this.service.findById(id); }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update quality review status' })
  update(@Param('id') id: string, @Body() dto: UpdateQualityReviewDto, @CurrentUser('id') userId: string) {
    return this.service.update(id, { ...dto, updatedBy: userId });
  }
}
