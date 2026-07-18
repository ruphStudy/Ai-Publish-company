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
  IsNumber,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import { ProviderStatus } from '../interfaces/provider.interface';

export class CreateProviderRegistrationDto {
  @ApiProperty({ description: 'Unique provider key', example: 'amazon-kdp-v1', minLength: 2, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  key: string;

  @ApiProperty({ description: 'Human-readable provider name', example: 'Amazon KDP Market Data', minLength: 2, maxLength: 200 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({ description: 'Provider version', example: '1.0.0', maxLength: 50 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  version: string;

  @ApiProperty({ description: 'Data source provider', enum: DataSourceProvider, example: DataSourceProvider.MANUAL })
  @IsEnum(DataSourceProvider, { message: 'provider must be a valid DataSourceProvider' })
  @IsNotEmpty()
  provider: DataSourceProvider;

  @ApiPropertyOptional({ description: 'Provider priority (1 = highest)', minimum: 1, maximum: 100, default: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: 'Enable provider on registration', default: false })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Execution timeout in milliseconds', minimum: 1000, default: 30000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional({ description: 'Maximum retry attempts', minimum: 0, maximum: 10, default: 3 })
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

  @ApiPropertyOptional({ description: 'Rate limit — requests per minute', minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimitRpm?: number;

  @ApiPropertyOptional({ description: 'Rate limit — requests per day', minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimitRpd?: number;

  @ApiPropertyOptional({ description: 'Provider-specific configuration', type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  customConfig?: Record<string, unknown>;
}

export class UpdateProviderRegistrationDto {
  @ApiPropertyOptional({ description: 'Human-readable provider name', maxLength: 200 })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ description: 'Provider status', enum: ProviderStatus })
  @IsEnum(ProviderStatus, { message: 'status must be a valid ProviderStatus' })
  @IsOptional()
  status?: ProviderStatus;

  @ApiPropertyOptional({ description: 'Provider priority', minimum: 1, maximum: 100 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional({ description: 'Execution timeout in milliseconds', minimum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  timeoutMs?: number;

  @ApiPropertyOptional({ description: 'Maximum retry attempts', minimum: 0, maximum: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  @IsOptional()
  maxRetries?: number;

  @ApiPropertyOptional({ description: 'Delay between retries in milliseconds', minimum: 1000 })
  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @IsOptional()
  retryDelayMs?: number;

  @ApiPropertyOptional({ description: 'Rate limit — requests per minute', minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimitRpm?: number;

  @ApiPropertyOptional({ description: 'Rate limit — requests per day', minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  rateLimitRpd?: number;

  @ApiPropertyOptional({ description: 'Provider-specific configuration', type: 'object', additionalProperties: true })
  @IsObject()
  @IsOptional()
  customConfig?: Record<string, unknown>;
}
