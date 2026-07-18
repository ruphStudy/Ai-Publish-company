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
  GenerateTableOfContentsDto,
  TableOfContentsQueryDto,
  UpdateTableOfContentsDto,
} from './dto';
import { TableOfContentsService } from './table-of-contents.service';

@ApiTags('Table Of Contents')
@ApiBearerAuth()
@Controller('table-of-contents')
export class TableOfContentsController {
  constructor(private readonly tableOfContentsService: TableOfContentsService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate publication-ready table of contents' })
  generate(
    @Body() dto: GenerateTableOfContentsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tableOfContentsService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search generated tables of contents' })
  search(@Query() query: TableOfContentsQueryDto) {
    return this.tableOfContentsService.search(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get TOC versions by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.tableOfContentsService.findByProjectId(projectId);
  }

  @Get('project/:projectId/latest')
  @ApiOperation({ summary: 'Get latest TOC by project' })
  latest(@Param('projectId') projectId: string) {
    return this.tableOfContentsService.latestTOC(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get TOC by id' })
  findOne(@Param('id') id: string) {
    return this.tableOfContentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update TOC' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTableOfContentsDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.tableOfContentsService.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Regenerate TOC' })
  regenerate(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.tableOfContentsService.regenerate(id, userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete TOC' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.tableOfContentsService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore TOC' })
  restore(@Param('id') id: string) {
    return this.tableOfContentsService.restore(id);
  }
}