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
  CoverPromptQueryDto,
  GenerateCoverPromptDto,
  RegenerateCoverPromptDto,
  UpdateCoverPromptDto,
} from './dto';
import { CoverPromptService } from './cover-prompt.service';

@ApiTags('Cover Prompts')
@ApiBearerAuth()
@Controller('cover-prompts')
export class CoverPromptController {
  constructor(private readonly coverPromptService: CoverPromptService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate AI-ready cover prompts' })
  generate(
    @Body() dto: GenerateCoverPromptDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.coverPromptService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search cover prompts' })
  search(@Query() query: CoverPromptQueryDto) {
    return this.coverPromptService.search(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get cover prompt versions by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.coverPromptService.findByProjectId(projectId);
  }

  @Get('project/:projectId/latest')
  @ApiOperation({ summary: 'Get latest cover prompt for project' })
  latest(@Param('projectId') projectId: string) {
    return this.coverPromptService.latestPrompt(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cover prompt by id' })
  findOne(@Param('id') id: string) {
    return this.coverPromptService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update cover prompt' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCoverPromptDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.coverPromptService.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Regenerate cover prompts' })
  regenerate(
    @Param('id') id: string,
    @Body() dto: RegenerateCoverPromptDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.coverPromptService.regenerate(id, {
      ...dto,
      generatedBy: userId,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete cover prompt' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.coverPromptService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore cover prompt' })
  restore(@Param('id') id: string) {
    return this.coverPromptService.restore(id);
  }
}