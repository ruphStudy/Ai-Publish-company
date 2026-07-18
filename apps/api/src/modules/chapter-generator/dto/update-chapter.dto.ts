import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { ChapterStatus } from '../entities/chapter.entity';

export class UpdateChapterSubsectionDto {
  @IsString()
  sectionNumber: string;

  @IsString()
  title: string;

  @IsString()
  objective: string;

  @IsString()
  summary: string;

  @IsNumber()
  @Min(1)
  estimatedWordCount: number;

  @IsString()
  writingInstructions: string;

  @IsNumber()
  @Min(1)
  order: number;
}

export class UpdateChapterSectionDto {
  @IsString()
  sectionNumber: string;

  @IsString()
  title: string;

  @IsString()
  objective: string;

  @IsString()
  summary: string;

  @IsNumber()
  @Min(1)
  estimatedWordCount: number;

  @IsString()
  writingInstructions: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChapterSubsectionDto)
  subsections: UpdateChapterSubsectionDto[];

  @IsNumber()
  @Min(1)
  order: number;
}

export class UpdateChapterDto {
  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsString()
  conclusion?: string;

  @IsOptional()
  @IsString()
  writingInstructions?: string;

  @IsOptional()
  @IsArray()
  keyConcepts?: string[];

  @IsOptional()
  @IsArray()
  examples?: string[];

  @IsOptional()
  @IsArray()
  references?: string[];

  @IsOptional()
  @IsArray()
  dependencies?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChapterSectionDto)
  sections?: UpdateChapterSectionDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @IsOptional()
  @IsEnum(ChapterStatus)
  status?: ChapterStatus;

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}