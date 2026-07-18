import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';

export class CreateSchedulerJobDto {
  @ApiProperty({ description: 'Unique job name', example: 'amazon-kdp-book-trends', minLength: 2, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ description: 'Job description', maxLength: 500 })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ description: 'Data source provider', enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  @IsEnum(DataSourceProvider, { message: 'provider must be a valid DataSourceProvider' })
  @IsNotEmpty()
  provider: DataSourceProvider;

  @ApiPropertyOptional({ description: 'Data type to collect (null = all types for provider)', enum: MarketDataType })
  @IsEnum(MarketDataType, { message: 'dataType must be a valid MarketDataType' })
  @IsOptional()
  dataType?: MarketDataType;

  @ApiPropertyOptional({ description: 'Default job parameters', type: 'object', additionalProperties: true, example: { market: 'US', language: 'en' } })
  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Execution interval in milliseconds (null = manual only)', example: 3600000, minimum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  intervalMs?: number;

  @ApiPropertyOptional({ description: 'Whether the job is enabled', default: true })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Maximum retry attempts on failure', minimum: 0, maximum: 10, default: 3 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Delay between retries in milliseconds', minimum: 1000, default: 5000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  retryDelayMs?: number;

  @ApiPropertyOptional({ description: 'Job timeout in milliseconds', minimum: 1000, default: 30000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;
}
