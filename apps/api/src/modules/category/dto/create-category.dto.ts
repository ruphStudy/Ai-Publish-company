import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  Matches,
  IsHexColor,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

import { CategoryStatus } from '../entities/category.entity';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'URL-friendly slug — auto-generated from name if omitted',
    example: 'technology',
    pattern: '^[a-z0-9-]+$',
    maxLength: 200,
  })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug?: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All technology-related content',
    maxLength: 500,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Parent category ID for future hierarchy support (null = top-level)',
    example: '507f1f77bcf86cd799439011',
  })
  @IsMongoId({ message: 'parentId must be a valid MongoDB ObjectId' })
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Display order — lower numbers appear first. Auto-assigned if omitted.',
    example: 0,
    minimum: 0,
  })
  @Type(() => Number)
  @IsInt({ message: 'displayOrder must be an integer' })
  @Min(0, { message: 'displayOrder must be 0 or greater' })
  @IsOptional()
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Category status',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
    example: CategoryStatus.ACTIVE,
  })
  @IsEnum(CategoryStatus, { message: 'status must be active or inactive' })
  @IsOptional()
  status?: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Icon identifier or URL',
    example: 'icon-technology',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Hex color code',
    example: '#3B82F6',
  })
  @IsHexColor({ message: 'color must be a valid hex color code' })
  @IsOptional()
  color?: string;
}
