import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsArray,
  Matches,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  DataSourceProvider,
  MarketDataType,
  MarketIntelligenceStatus,
} from '../entities/market-intelligence.entity';

export class CreateMarketIntelligenceDto {
  @ApiProperty({ description: 'Record title', example: 'Fantasy Genre Trends Q3 2026', minLength: 2, maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({ description: 'URL-friendly slug — auto-generated if omitted', example: 'fantasy-genre-trends-q3-2026', maxLength: 320 })
  @IsString()
  @IsOptional()
  @MaxLength(320)
  @Matches(/^[a-z0-9-]+$/, { message: 'Slug must contain only lowercase letters, numbers, and hyphens' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Record description', maxLength: 2000 })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ description: 'Data source provider', enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  @IsEnum(DataSourceProvider, { message: 'source must be a valid DataSourceProvider' })
  @IsNotEmpty()
  source: DataSourceProvider;

  @ApiProperty({ description: 'Type of market data', enum: MarketDataType, example: MarketDataType.MARKET_TREND })
  @IsEnum(MarketDataType, { message: 'dataType must be a valid MarketDataType' })
  @IsNotEmpty()
  dataType: MarketDataType;

  @ApiPropertyOptional({ description: 'Record status', enum: MarketIntelligenceStatus, default: MarketIntelligenceStatus.PENDING })
  @IsEnum(MarketIntelligenceStatus, { message: 'status must be a valid MarketIntelligenceStatus' })
  @IsOptional()
  status?: MarketIntelligenceStatus;

  @ApiPropertyOptional({ description: 'Opportunity score (0–100)', minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber({}, { message: 'opportunityScore must be a number' })
  @Min(0)
  @Max(100)
  @IsOptional()
  opportunityScore?: number;

  @ApiPropertyOptional({ description: 'Genre classification', example: 'Fantasy', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  genre?: string;

  @ApiPropertyOptional({ description: 'Keywords associated with this record', type: [String], example: ['fantasy', 'dragons', 'magic'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  keywords?: string[];

  @ApiPropertyOptional({ description: 'ISO 639-1 language code', example: 'en', maxLength: 10 })
  @IsString()
  @IsOptional()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ description: 'Geographic market', example: 'US', maxLength: 100 })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  market?: string;

  @ApiPropertyOptional({ description: 'Data period start (ISO 8601)', example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  periodStart?: string;

  @ApiPropertyOptional({ description: 'Data period end (ISO 8601)', example: '2026-09-30T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  periodEnd?: string;
}
