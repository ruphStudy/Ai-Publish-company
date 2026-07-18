import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User} from '../auth/entities/user.entity';
import { UserRole } from '../auth/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  BookBlueprintQueryDto} from './dto';
import {
  BookBlueprintResponseDto,
  GenerateBookBlueprintDto,
  PaginatedBookBlueprintResponseDto,
  UpdateBookBlueprintDto,
} from './dto';
import { BookBlueprintService } from './book-blueprint.service';

@ApiTags('book-blueprints')
@Controller('book-blueprints')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookBlueprintController {
  constructor(private readonly service: BookBlueprintService) {}

  @Post('generate')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Generate a book blueprint' })
  @ApiBody({ type: GenerateBookBlueprintDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookBlueprintResponseDto })
  async generate(
    @Body() dto: GenerateBookBlueprintDto,
    @CurrentUser() user: User,
  ): Promise<BookBlueprintResponseDto> {
    return this.service.generate(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List book blueprints' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedBookBlueprintResponseDto })
  async findAll(
    @Query() query: BookBlueprintQueryDto,
  ): Promise<PaginatedBookBlueprintResponseDto> {
    return this.service.findAll(query);
  }

  @Get('project/:projectId/latest')
  @ApiOperation({ summary: 'Get the latest blueprint for a project' })
  @ApiParam({ name: 'projectId' })
  @ApiResponse({ status: HttpStatus.OK, type: BookBlueprintResponseDto })
  async latestBlueprint(
    @Param('projectId') projectId: string,
  ): Promise<BookBlueprintResponseDto> {
    return this.service.latestBlueprint(projectId);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get all blueprints for a project' })
  @ApiParam({ name: 'projectId' })
  @ApiResponse({ status: HttpStatus.OK, type: [BookBlueprintResponseDto] })
  async findByProjectId(
    @Param('projectId') projectId: string,
  ): Promise<BookBlueprintResponseDto[]> {
    return this.service.findByProjectId(projectId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book blueprint by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: BookBlueprintResponseDto })
  async findOne(@Param('id') id: string): Promise<BookBlueprintResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update a book blueprint' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateBookBlueprintDto })
  @ApiResponse({ status: HttpStatus.OK, type: BookBlueprintResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookBlueprintDto,
    @CurrentUser() user: User,
  ): Promise<BookBlueprintResponseDto> {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a book blueprint' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.service.remove(id, user.id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted book blueprint' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: BookBlueprintResponseDto })
  async restore(@Param('id') id: string): Promise<BookBlueprintResponseDto> {
    return this.service.restore(id);
  }
}