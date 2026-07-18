import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ExportFormat } from '../entities/export-artifact.entity';
import { ExportJobStatus } from '../entities/export-job.entity';

export class CreateExportDto {
  @IsMongoId()
  projectId: string;

  @IsMongoId()
  blueprintId: string;

  @IsMongoId()
  metadataId: string;

  @IsMongoId()
  tocId: string;

  @IsMongoId()
  coverPromptId: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ExportFormat, { each: true })
  formats: ExportFormat[];

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class ExportQueryDto {
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsEnum(ExportJobStatus)
  status?: ExportJobStatus;

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