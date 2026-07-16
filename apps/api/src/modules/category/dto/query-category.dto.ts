import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

import { CategoryStatus } from '../entities/category.entity';

export class CategoryQueryDto {
  @ApiPropertyOptional({
    description: 'Full-text search across name and description',
    example: 'technology',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by category status',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE,
  })
  @IsEnum(CategoryStatus, { message: 'status must be active or inactive' })
  @IsOptional()
  status?: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['name', 'displayOrder', 'createdAt', 'updatedAt'],
    default: 'displayOrder',
    example: 'displayOrder',
  })
  @IsIn(['name', 'displayOrder', 'createdAt', 'updatedAt'], {
    message: 'sortBy must be one of: name, displayOrder, createdAt, updatedAt',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'asc',
    example: 'asc',
  })
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be asc or desc' })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Results per page (max 100)',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
