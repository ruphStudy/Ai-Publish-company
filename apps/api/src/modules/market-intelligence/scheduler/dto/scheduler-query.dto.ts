import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsBoolean, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';

export class SchedulerJobQueryDto {
  @ApiPropertyOptional({ description: 'Filter by provider', enum: DataSourceProvider })
  @IsEnum(DataSourceProvider, { message: 'provider must be a valid DataSourceProvider' })
  @IsOptional()
  provider?: DataSourceProvider;

  @ApiPropertyOptional({ description: 'Filter by enabled state', type: Boolean })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Sort field', enum: ['name', 'provider', 'lastExecutedAt', 'createdAt', 'consecutiveFailures'], default: 'createdAt' })
  @IsIn(['name', 'provider', 'lastExecutedAt', 'createdAt', 'consecutiveFailures'], {
    message: 'sortBy must be one of: name, provider, lastExecutedAt, createdAt, consecutiveFailures',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort direction', enum: ['asc', 'desc'], default: 'asc' })
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ description: 'Page number (1-based)', minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Results per page (max 100)', minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class JobExecutionQueryDto {
  @ApiPropertyOptional({ description: 'Filter by execution status', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] })
  @IsString()
  @IsOptional()
  status?: string;

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

  @ApiPropertyOptional({ description: 'Results per page (max 100)', minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
