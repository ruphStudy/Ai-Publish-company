import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  DataSourceProvider,
  MarketDataType,
  MarketIntelligenceStatus,
} from '../entities/market-intelligence.entity';

export class MarketIntelligenceQueryDto {
  @ApiPropertyOptional({ description: 'Full-text search across title, description, genre and keywords', example: 'fantasy' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by data source provider', enum: DataSourceProvider })
  @IsEnum(DataSourceProvider, { message: 'source must be a valid DataSourceProvider' })
  @IsOptional()
  source?: DataSourceProvider;

  @ApiPropertyOptional({ description: 'Filter by data type', enum: MarketDataType })
  @IsEnum(MarketDataType, { message: 'dataType must be a valid MarketDataType' })
  @IsOptional()
  dataType?: MarketDataType;

  @ApiPropertyOptional({ description: 'Filter by status', enum: MarketIntelligenceStatus })
  @IsEnum(MarketIntelligenceStatus, { message: 'status must be a valid MarketIntelligenceStatus' })
  @IsOptional()
  status?: MarketIntelligenceStatus;

  @ApiPropertyOptional({ description: 'Filter by language code', example: 'en' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ description: 'Filter by geographic market', example: 'US' })
  @IsString()
  @IsOptional()
  market?: string;

  @ApiPropertyOptional({ description: 'Minimum opportunity score (0–100)', minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  minScore?: number;

  @ApiPropertyOptional({ description: 'Maximum opportunity score (0–100)', minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  maxScore?: number;

  @ApiPropertyOptional({ description: 'Filter records created on or after (ISO 8601)', example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  createdAfter?: string;

  @ApiPropertyOptional({ description: 'Filter records created on or before (ISO 8601)', example: '2026-12-31T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Field to sort by', enum: ['title', 'opportunityScore', 'createdAt', 'lastProcessedAt', 'updatedAt'], default: 'createdAt' })
  @IsIn(['title', 'opportunityScore', 'createdAt', 'lastProcessedAt', 'updatedAt'], {
    message: 'sortBy must be one of: title, opportunityScore, createdAt, lastProcessedAt, updatedAt',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'], default: 'desc' })
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page (max 100)', minimum: 1, maximum: 100, default: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
