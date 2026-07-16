import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CategoryStatus } from '../entities/category.entity';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '507f1f77bcf86cd799439011',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Technology',
  })
  name: string;

  @ApiProperty({
    description: 'URL-friendly slug',
    example: 'technology',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'All technology-related content',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Parent category ID (null if top-level)',
    example: '507f1f77bcf86cd799439011',
    nullable: true,
  })
  parentId: string | null;

  @ApiProperty({
    description: 'Display order — lower numbers appear first',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Category status',
    enum: CategoryStatus,
    example: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Icon identifier or URL',
    example: 'icon-technology',
    nullable: true,
  })
  icon: string | null;

  @ApiPropertyOptional({
    description: 'Hex color code',
    example: '#3B82F6',
    nullable: true,
  })
  color: string | null;

  @ApiProperty({
    description: 'Creation timestamp (UTC)',
    example: '2026-07-12T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last updated timestamp (UTC)',
    example: '2026-07-12T10:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedCategoryResponseDto {
  @ApiProperty({ description: 'Array of categories', type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    example: {
      total: 42,
      page: 1,
      limit: 10,
      totalPages: 5,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
