import { PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ChapterOutlineStatus,
} from '../entities/chapter-outline.entity';
import { OutlineStatus } from '../entities/outline.entity';

export class UpdateChapterOutlineDto {
  @IsNumber()
  @Min(1)
  chapterNumber: number;

  @IsNumber()
  @Min(1)
  partNumber: number;

  @IsString()
  partTitle: string;

  @IsString()
  chapterTitle: string;

  @IsString()
  objective: string;

  @IsString()
  summary: string;

  @IsNumber()
  @Min(1)
  estimatedWordCount: number;

  @IsArray()
  keyTopics: string[];

  @IsArray()
  learningOutcomes: string[];

  @IsString()
  writingInstructions: string;

  @IsArray()
  references: string[];

  @IsEnum(ChapterOutlineStatus)
  status: ChapterOutlineStatus;
}

export class UpdateOutlineDto extends PartialType(class {}) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  outlineSummary?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedWordCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedReadingTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceScore?: number;

  @IsOptional()
  @IsEnum(OutlineStatus)
  status?: OutlineStatus;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateChapterOutlineDto)
  chapters?: UpdateChapterOutlineDto[];

  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}