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
  GenerateOutlineDto,
  OutlineQueryDto,
  UpdateOutlineDto,
} from './dto';
import { OutlineService } from './outline.service';

@ApiTags('Outlines')
@ApiBearerAuth()
@Controller('outlines')
export class OutlineController {
  constructor(private readonly outlineService: OutlineService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate an outline from an approved blueprint' })
  generate(
    @Body() dto: GenerateOutlineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.outlineService.generate({
      ...dto,
      generatedBy: userId,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Search and paginate outlines' })
  search(@Query() query: OutlineQueryDto) {
    return this.outlineService.search(query);
  }

  @Get('blueprint/:blueprintId/latest')
  @ApiOperation({ summary: 'Get the latest outline for a blueprint' })
  latest(@Param('blueprintId') blueprintId: string) {
    return this.outlineService.latestOutline(blueprintId);
  }

  @Get('blueprint/:blueprintId')
  @ApiOperation({ summary: 'Get all outlines for a blueprint' })
  findByBlueprint(@Param('blueprintId') blueprintId: string) {
    return this.outlineService.findByBlueprintId(blueprintId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an outline by id' })
  findOne(@Param('id') id: string) {
    return this.outlineService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update an outline' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateOutlineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.outlineService.update(id, {
      ...dto,
      updatedBy: userId,
    });
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Soft delete an outline' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    await this.outlineService.softDelete(id, userId);

    return { success: true };
  }

  @Post(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted outline' })
  restore(@Param('id') id: string) {
    return this.outlineService.restore(id);
  }
}