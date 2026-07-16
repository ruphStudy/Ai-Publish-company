import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import {
  BookProjectStage,
  BookProjectStatus,
} from '../entities/book-project.entity';

export class CreateBookProjectDto {
  @ApiProperty({ minLength: 2, maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(300)
  title: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiProperty()
  @IsMongoId()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  subCategoryId?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  niche?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  microNiche?: string;

  @ApiProperty({ example: 'en', minLength: 2, maxLength: 10 })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(10)
  language: string;

  @ApiProperty({ example: 'US', maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetMarket: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  targetAudience?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  writingStyle?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tone?: string;

  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  objective?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedWordCount?: number;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedChapterCount?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetPlatforms?: string[];

  @ApiPropertyOptional({ maxLength: 200 })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  aiModel?: string;

  @ApiPropertyOptional({ enum: BookProjectStatus, default: BookProjectStatus.DRAFT })
  @IsOptional()
  @IsEnum(BookProjectStatus)
  status?: BookProjectStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 100, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({
    enum: BookProjectStage,
    default: BookProjectStage.PROJECT_CREATED,
  })
  @IsOptional()
  @IsEnum(BookProjectStage)
  currentStage?: BookProjectStage;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  ownerId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: 'object' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}