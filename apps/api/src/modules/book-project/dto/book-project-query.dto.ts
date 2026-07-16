import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  BookProjectStage,
  BookProjectStatus,
} from '../entities/book-project.entity';

export class BookProjectQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subCategoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  niche?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: BookProjectStatus })
  @IsOptional()
  @IsEnum(BookProjectStatus)
  status?: BookProjectStatus;

  @ApiPropertyOptional({ enum: BookProjectStage })
  @IsOptional()
  @IsEnum(BookProjectStage)
  currentStage?: BookProjectStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @ApiPropertyOptional({
    enum: ['projectCode', 'title', 'progress', 'createdAt', 'updatedAt'],
    default: 'updatedAt',
  })
  @IsOptional()
  @IsIn(['projectCode', 'title', 'progress', 'createdAt', 'updatedAt'])
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