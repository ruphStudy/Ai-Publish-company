import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import { DataSourceProvider } from '../../entities/market-intelligence.entity';
import {
  MonitoringExecutionStatus,
  MonitoringExecutionType,
} from '../models/monitoring.model';

export class MonitoringExecutionQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobName?: string;

  @ApiPropertyOptional({ enum: DataSourceProvider })
  @IsOptional()
  @IsEnum(DataSourceProvider)
  provider?: DataSourceProvider;

  @ApiPropertyOptional({ enum: MonitoringExecutionStatus })
  @IsOptional()
  @IsEnum(MonitoringExecutionStatus)
  status?: MonitoringExecutionStatus;

  @ApiPropertyOptional({ enum: MonitoringExecutionType })
  @IsOptional()
  @IsEnum(MonitoringExecutionType)
  executionType?: MonitoringExecutionType;

  @ApiPropertyOptional({ default: 'createdAt' })
  @IsOptional()
  @IsIn(['startTime', 'endTime', 'duration', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}