import {
  Body,
  Controller,
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
import { ExportService } from './export.service';
import { CreateExportDto, ExportQueryDto } from './dto';

@ApiTags('Exports')
@ApiBearerAuth()
@Controller('exports')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create publication-ready export files' })
  create(
    @Body() dto: CreateExportDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.exportService.create({ ...dto, createdBy: userId });
  }

  @Get()
  search(@Query() query: ExportQueryDto) {
    return this.exportService.search(query);
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string) {
    return this.exportService.findByProjectId(projectId);
  }

  @Get('project/:projectId/latest')
  latest(@Param('projectId') projectId: string) {
    return this.exportService.latestExport(projectId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exportService.findOne(id);
  }
}