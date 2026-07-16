import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookStatus, BookStage } from '../entities/book.entity';

export class BookResponseDto {
  @ApiProperty({ description: 'Book ID', example: '507f1f77bcf86cd799439011' })
  id: string;

  @ApiProperty({ description: 'Book title', example: 'Introduction to TypeScript' })
  title: string;

  @ApiPropertyOptional({ description: 'Book subtitle', nullable: true, example: 'A practical guide for beginners' })
  subtitle: string | null;

  @ApiProperty({ description: 'URL-friendly slug', example: 'introduction-to-typescript' })
  slug: string;

  @ApiPropertyOptional({ description: 'Full book description', nullable: true })
  description: string | null;

  @ApiPropertyOptional({ description: 'Short summary', nullable: true })
  summary: string | null;

  @ApiProperty({ description: 'Category ID', example: '507f1f77bcf86cd799439011' })
  categoryId: string;

  @ApiProperty({ description: 'Book status', enum: BookStatus, example: BookStatus.DRAFT })
  status: BookStatus;

  @ApiProperty({ description: 'Language code', example: 'en' })
  language: string;

  @ApiPropertyOptional({ description: 'Target audience description', nullable: true })
  targetAudience: string | null;

  @ApiPropertyOptional({ description: 'Learning objective', nullable: true })
  objective: string | null;

  @ApiPropertyOptional({ description: 'Estimated number of pages', nullable: true, example: 250 })
  estimatedPages: number | null;

  @ApiProperty({ description: 'Current production stage', enum: BookStage, example: BookStage.IDEA })
  currentStage: BookStage;

  @ApiPropertyOptional({ description: 'Quality score (0–100)', nullable: true, example: 85 })
  qualityScore: number | null;

  @ApiProperty({ description: 'Creation timestamp (UTC)', example: '2026-07-12T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last updated timestamp (UTC)', example: '2026-07-12T10:00:00.000Z' })
  updatedAt: Date;
}

export class PaginatedBookResponseDto {
  @ApiProperty({ description: 'Array of books', type: [BookResponseDto] })
  data: BookResponseDto[];

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
