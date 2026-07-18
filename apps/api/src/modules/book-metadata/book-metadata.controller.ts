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
  BookMetadataQueryDto,
  GenerateBookMetadataDto,
  RegenerateBookMetadataDto,
  UpdateBookMetadataDto,
} from './dto';
import { BookMetadataService } from './book-metadata.service';

@ApiTags('Book Metadata')
@ApiBearerAuth()
@Controller('book-metadata')
export class BookMetadataController {
  constructor(private readonly bookMetadataService: BookMetadataService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate publishing metadata' })
  generate(
    @Body() dto: GenerateBookMetadataDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookMetadataService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search publishing metadata' })
  search(@Query() query: BookMetadataQueryDto) {
    return this.bookMetadataService.search(query);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get metadata versions by project' })
  findByProject(@Param('projectId') projectId: string) {
    return this.bookMetadataService.findByProjectId(projectId);
  }

  @Get('project/:projectId/latest')
  @ApiOperation({ summary: 'Get latest metadata for a project' })
  latest(@Param('projectId') projectId: string) {
    return this.bookMetadataService.latestMetadata(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get metadata by id' })
  findOne(@Param('id') id: string) {
    return this.bookMetadataService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update metadata' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookMetadataDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookMetadataService.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Regenerate publishing metadata' })
  regenerate(
    @Param('id') id: string,
    @Body() dto: RegenerateBookMetadataDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.bookMetadataService.regenerate(id, {
      ...dto,
      generatedBy: userId,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete metadata' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.bookMetadataService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore metadata' })
  restore(@Param('id') id: string) {
    return this.bookMetadataService.restore(id);
  }
}