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
import { TableOfContentsStatus } from '../entities/table-of-contents.entity';

export class GenerateTableOfContentsDto {
  @IsMongoId()
  projectId: string;

  @IsMongoId()
  blueprintId: string;

  @IsMongoId()
  metadataId: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class UpdateTableOfContentsDto {
  @IsOptional()
  @IsEnum(TableOfContentsStatus)
  status?: TableOfContentsStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class TableOfContentsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsEnum(TableOfContentsStatus)
  status?: TableOfContentsStatus;

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