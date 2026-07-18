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
  BookProjectQueryDto} from './dto';
import {
  BookProjectResponseDto,
  CreateBookProjectDto,
  PaginatedBookProjectResponseDto,
  UpdateBookProjectDto,
} from './dto';
import { BookProjectService } from './book-project.service';

@ApiTags('book-projects')
@Controller('book-projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookProjectController {
  constructor(private readonly service: BookProjectService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create a book project' })
  @ApiBody({ type: CreateBookProjectDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: BookProjectResponseDto })
  async create(
    @Body() dto: CreateBookProjectDto,
    @CurrentUser() user: User,
  ): Promise<BookProjectResponseDto> {
    return this.service.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List book projects' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedBookProjectResponseDto })
  async findAll(
    @Query() query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResponseDto> {
    return this.service.findAll(query);
  }

  @Get('code/:projectCode')
  @ApiOperation({ summary: 'Get a book project by project code' })
  @ApiParam({ name: 'projectCode' })
  @ApiResponse({ status: HttpStatus.OK, type: BookProjectResponseDto })
  async findByProjectCode(
    @Param('projectCode') projectCode: string,
  ): Promise<BookProjectResponseDto> {
    return this.service.findByProjectCode(projectCode);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book project by ID' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: BookProjectResponseDto })
  async findOne(@Param('id') id: string): Promise<BookProjectResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update a book project' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateBookProjectDto })
  @ApiResponse({ status: HttpStatus.OK, type: BookProjectResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookProjectDto,
    @CurrentUser() user: User,
  ): Promise<BookProjectResponseDto> {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a book project' })
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
  @ApiOperation({ summary: 'Restore a soft-deleted book project' })
  @ApiParam({ name: 'id' })
  @ApiResponse({ status: HttpStatus.OK, type: BookProjectResponseDto })
  async restore(@Param('id') id: string): Promise<BookProjectResponseDto> {
    return this.service.restore(id);
  }
}