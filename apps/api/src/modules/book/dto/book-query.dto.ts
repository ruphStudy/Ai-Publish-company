import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsIn,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

import { BookStatus, BookStage } from '../entities/book.entity';

export class BookQueryDto {
  @ApiPropertyOptional({
    description: 'Full-text search across title, description and summary',
    example: 'typescript',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by book status',
    enum: BookStatus,
    example: BookStatus.DRAFT,
  })
  @IsEnum(BookStatus, { message: 'status must be a valid BookStatus' })
  @IsOptional()
  status?: BookStatus;

  @ApiPropertyOptional({
    description: 'Filter by language code',
    example: 'en',
  })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({
    description: 'Filter by category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'categoryId must be a valid MongoDB ObjectId' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filter by current production stage',
    enum: BookStage,
    example: BookStage.IDEA,
  })
  @IsEnum(BookStage, { message: 'currentStage must be a valid BookStage' })
  @IsOptional()
  currentStage?: BookStage;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['title', 'createdAt', 'updatedAt', 'qualityScore'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsIn(['title', 'createdAt', 'updatedAt', 'qualityScore'], {
    message: 'sortBy must be one of: title, createdAt, updatedAt, qualityScore',
  })
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
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
