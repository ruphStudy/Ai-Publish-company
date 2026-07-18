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

import { MarketIntelligenceService } from './market-intelligence.service';
import {
  MarketIntelligenceQueryDto} from './dto';
import {
  CreateMarketIntelligenceDto,
  UpdateMarketIntelligenceDto,
  MarketIntelligenceResponseDto,
  PaginatedMarketIntelligenceResponseDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { User } from '../auth/entities/user.entity';

@ApiTags('market-intelligence')
@Controller('market-intelligence')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MarketIntelligenceController {
  constructor(private readonly service: MarketIntelligenceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Create a market intelligence record', description: 'Requires ADMIN or EDITOR role.' })
  @ApiBody({ type: CreateMarketIntelligenceDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Record created successfully', type: MarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN or EDITOR role' })
  async create(
    @Body() dto: CreateMarketIntelligenceDto,
    @CurrentUser() user: User,
  ): Promise<MarketIntelligenceResponseDto> {
    return this.service.create(dto, user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'List market intelligence records',
    description: 'Supports pagination, full-text search, sorting and multi-field filtering.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Records retrieved successfully', type: PaginatedMarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findAll(
    @Query() query: MarketIntelligenceQueryDto,
  ): Promise<PaginatedMarketIntelligenceResponseDto> {
    return this.service.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a market intelligence record by slug' })
  @ApiParam({ name: 'slug', description: 'Record slug', example: 'fantasy-genre-trends-q3-2026' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record retrieved successfully', type: MarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findBySlug(@Param('slug') slug: string): Promise<MarketIntelligenceResponseDto> {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a market intelligence record by ID' })
  @ApiParam({ name: 'id', description: 'Record ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record retrieved successfully', type: MarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async findOne(@Param('id') id: string): Promise<MarketIntelligenceResponseDto> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.EDITOR)
  @ApiOperation({ summary: 'Update a market intelligence record', description: 'Requires ADMIN or EDITOR role.' })
  @ApiParam({ name: 'id', description: 'Record ID', example: '507f1f77bcf86cd799439011' })
  @ApiBody({ type: UpdateMarketIntelligenceDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record updated successfully', type: MarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Slug already exists' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation error' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN or EDITOR role' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMarketIntelligenceDto,
    @CurrentUser() user: User,
  ): Promise<MarketIntelligenceResponseDto> {
    return this.service.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a market intelligence record', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Record ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Record deleted successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    return this.service.remove(id, user.id);
  }

  @Patch(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted market intelligence record', description: 'Requires ADMIN role.' })
  @ApiParam({ name: 'id', description: 'Record ID', example: '507f1f77bcf86cd799439011' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Record restored successfully', type: MarketIntelligenceResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Record not found or cannot be restored' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Forbidden — Requires ADMIN role' })
  async restore(@Param('id') id: string): Promise<MarketIntelligenceResponseDto> {
    return this.service.restore(id);
  }
}
