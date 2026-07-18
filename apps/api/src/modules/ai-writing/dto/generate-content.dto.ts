import {
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class GenerateContentDto {
  @IsMongoId()
  blueprintId: string;

  @IsMongoId()
  outlineId: string;

  @IsMongoId()
  chapterId: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class RegenerateSectionDto {
  @IsString()
  sectionNumber: string;

  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class RegenerateChapterDto {
  @IsOptional()
  @IsString()
  instruction?: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}

export class ContentQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsMongoId()
  chapterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit: number = 20;
}