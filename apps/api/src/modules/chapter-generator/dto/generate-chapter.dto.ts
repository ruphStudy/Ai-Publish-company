import { IsMongoId, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class GenerateChapterDto {
  @IsMongoId()
  blueprintId: string;

  @IsMongoId()
  outlineId: string;

  @IsNumber()
  @Min(1)
  chapterNumber: number;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}