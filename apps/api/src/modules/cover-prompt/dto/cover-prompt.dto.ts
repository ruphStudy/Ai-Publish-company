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
import { CoverPromptStatus } from '../entities/cover-prompt.entity';

export class GenerateCoverPromptDto {
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

export class RegenerateCoverPromptDto {
  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class UpdateCoverPromptDto {
  @IsOptional()
  @IsString()
  visualTheme?: string;

  @IsOptional()
  @IsString()
  artStyle?: string;

  @IsOptional()
  @IsString()
  typographyStyle?: string;

  @IsOptional()
  @IsEnum(CoverPromptStatus)
  status?: CoverPromptStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class CoverPromptQueryDto {
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
  @IsEnum(CoverPromptStatus)
  status?: CoverPromptStatus;

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