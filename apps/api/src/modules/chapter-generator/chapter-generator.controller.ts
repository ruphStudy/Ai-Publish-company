import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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
  ChapterQueryDto,
  GenerateChapterDto,
  UpdateChapterDto,
} from './dto';
import { ChapterGeneratorService } from './chapter-generator.service';

@ApiTags('Chapter Generator')
@ApiBearerAuth()
@Controller('chapter-generator')
export class ChapterGeneratorController {
  constructor(
    private readonly chapterGeneratorService: ChapterGeneratorService,
  ) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate a chapter blueprint' })
  generate(
    @Body() dto: GenerateChapterDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chapterGeneratorService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search chapter blueprints' })
  search(@Query() query: ChapterQueryDto) {
    return this.chapterGeneratorService.search(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get chapter blueprints by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.chapterGeneratorService.findByProjectId(projectId);
  }

  @Get('outline/:outlineId')
  @ApiOperation({ summary: 'Get chapter blueprints by outline' })
  findByOutline(@Param('outlineId') outlineId: string) {
    return this.chapterGeneratorService.findByOutlineId(outlineId);
  }

  @Get('outline/:outlineId/chapter/:chapterNumber/latest')
  @ApiOperation({ summary: 'Get the latest chapter blueprint version' })
  latest(
    @Param('outlineId') outlineId: string,
    @Param('chapterNumber') chapterNumber: string,
  ) {
    return this.chapterGeneratorService.latestChapter(
      outlineId,
      Number(chapterNumber),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get chapter blueprint by id' })
  findOne(@Param('id') id: string) {
    return this.chapterGeneratorService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update chapter blueprint' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.chapterGeneratorService.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete chapter blueprint' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.chapterGeneratorService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore chapter blueprint' })
  restore(@Param('id') id: string) {
    return this.chapterGeneratorService.restore(id);
  }
}