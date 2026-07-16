import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

import { BookService } from './book.service';
import {
  CreateBookDto,
  UpdateBookDto,
  BookQueryDto,
  BookResponseDto,
  PaginatedBookResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import type { User } from '../auth/entities/user.entity';

@ApiTags('books')
@Controller('books')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Create a new book. Requires ADMIN or EDITOR role.',
  })
  @ApiBody({ type: CreateBookDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Book created successfully', type: BookResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Duplicate title in this language, or slug already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN or EDITOR role' })
  async create(
    @Body() dto: CreateBookDto,
    @CurrentUser() user: User,
  ): Promise<BookResponseDto> {
    return this.bookService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List books',
    description: 'List all books with pagination, full-text search, sorting, and filtering.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Books retrieved successfully', type: PaginatedBookResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findAll(@Query() query: BookQueryDto): Promise<PaginatedBookResponseDto> {
    return this.bookService.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a book by slug' })
  @ApiParam({ name: 'slug', description: 'Book slug', example: 'introduction-to-typescript' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book retrieved successfully', type: BookResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findBySlug(@Param('slug') slug: string): Promise<BookResponseDto> {
    return this.bookService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiParam({ name: 'id', description: 'Book ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book retrieved successfully', type: BookResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<BookResponseDto> {
    return this.bookService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({
    summary: 'Update a book',
    description: 'Update an existing book. Requires ADMIN or EDITOR role.',
  })
  @ApiParam({ name: 'id', description: 'Book ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateBookDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book updated successfully', type: BookResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Duplicate title in this language, or slug already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN or EDITOR role' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @CurrentUser() user: User,
  ): Promise<BookResponseDto> {
    return this.bookService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a book',
    description: 'Soft delete a book. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Book ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Book deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.bookService.remove(id, user.id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Restore a deleted book',
    description: 'Restore a soft-deleted book. Requires ADMIN role.',
  })
  @ApiParam({ name: 'id', description: 'Book ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Book restored successfully', type: BookResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Book not found or cannot be restored' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async restore(@Param('id') id: string): Promise<BookResponseDto> {
    return this.bookService.restore(id);
  }
}
