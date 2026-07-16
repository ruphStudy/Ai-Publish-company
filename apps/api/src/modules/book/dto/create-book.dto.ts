import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  IsMongoId,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

import { BookStatus, BookStage } from '../entities/book.entity';

export class CreateBookDto {
  @ApiProperty({
    description: 'Book title',
    example: 'Introduction to TypeScript',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Book subtitle',
    example: 'A practical guide for beginners',
    maxLength: 300,
  })
  @IsString()
  @IsOptional()
  @MaxLength(300)
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug — auto-generated from title if omitted',
    example: 'introduction-to-typescript',
    pattern: '^[a-z0-9-]+$',
    maxLength: 220,
  })
  @IsString()
  @IsOptional()
  @MaxLength(220)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Full book description',
    example: 'A comprehensive guide to TypeScript development.',
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Short summary',
    example: 'Learn TypeScript from scratch.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string;

  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'categoryId must be a valid MongoDB ObjectId' })
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Book status',
    enum: BookStatus,
    default: BookStatus.DRAFT,
    example: BookStatus.DRAFT,
  })
  @IsEnum(BookStatus, { message: 'status must be a valid BookStatus' })
  @IsOptional()
  status?: BookStatus;

  @ApiProperty({
    description: 'ISO 639-1 language code or locale',
    example: 'en',
    minLength: 2,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  language: string;

  @ApiPropertyOptional({
    description: 'Target audience description',
    example: 'Junior developers with basic JavaScript knowledge',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Learning objective',
    example: 'Master TypeScript fundamentals and advanced patterns.',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  objective?: string;

  @ApiPropertyOptional({
    description: 'Estimated number of pages',
    example: 250,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({ message: 'estimatedPages must be an integer' })
  @Min(1, { message: 'estimatedPages must be at least 1' })
  @IsOptional()
  estimatedPages?: number;

  @ApiPropertyOptional({
    description: 'Current production stage',
    enum: BookStage,
    default: BookStage.IDEA,
    example: BookStage.IDEA,
  })
  @IsEnum(BookStage, { message: 'currentStage must be a valid BookStage' })
  @IsOptional()
  currentStage?: BookStage;

  @ApiPropertyOptional({
    description: 'Quality score (0–100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'qualityScore must be a number' })
  @Min(0)
  @Max(100)
  @IsOptional()
  qualityScore?: number;
}
