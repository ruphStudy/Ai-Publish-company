import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import {
  ContentQueryDto,
  GenerateContentDto,
  RegenerateChapterDto,
  RegenerateSectionDto,
} from './dto';
import { AIWritingService } from './ai-writing.service';

@ApiTags('AI Writing')
@ApiBearerAuth()
@Controller('ai-writing')
export class AIWritingController {
  constructor(private readonly aiWritingService: AIWritingService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate publication-ready chapter content' })
  generate(
    @Body() dto: GenerateContentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiWritingService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search generated book content' })
  search(@Query() query: ContentQueryDto) {
    return this.aiWritingService.search(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get generated content by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.aiWritingService.findByProjectId(projectId);
  }

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: 'Get generated content by chapter' })
  findByChapter(@Param('chapterId') chapterId: string) {
    return this.aiWritingService.findByChapterId(chapterId);
  }

  @Get('chapter/:chapterId/latest')
  @ApiOperation({ summary: 'Get latest chapter content version' })
  latestVersion(@Param('chapterId') chapterId: string) {
    return this.aiWritingService.latestVersion(chapterId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get generated content by id' })
  findOne(@Param('id') id: string) {
    return this.aiWritingService.findOne(id);
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Regenerate complete chapter content' })
  regenerateChapter(
    @Param('id') id: string,
    @Body() dto: RegenerateChapterDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiWritingService.regenerateChapter(id, {
      ...dto,
      generatedBy: userId,
    });
  }

  @Post(':id/sections/regenerate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Regenerate a generated content section' })
  regenerateSection(
    @Param('id') id: string,
    @Body() dto: RegenerateSectionDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.aiWritingService.regenerateSection(id, {
      ...dto,
      generatedBy: userId,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete generated content' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.aiWritingService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore generated content' })
  restore(@Param('id') id: string) {
    return this.aiWritingService.restore(id);
  }
}