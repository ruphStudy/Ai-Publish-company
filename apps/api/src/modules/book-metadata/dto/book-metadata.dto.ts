import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BookMetadataStatus } from '../entities/book-metadata.entity';

export class GenerateBookMetadataDto {
  @IsMongoId()
  projectId: string;

  @IsMongoId()
  blueprintId: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class RegenerateBookMetadataDto {
  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class UpdateBookMetadataDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  authorName?: string;

  @IsOptional()
  @IsString()
  publisherName?: string;

  @IsOptional()
  @IsEnum(BookMetadataStatus)
  status?: BookMetadataStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class BookMetadataQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  blueprintId?: string;

  @IsOptional()
  @IsEnum(BookMetadataStatus)
  status?: BookMetadataStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;
}