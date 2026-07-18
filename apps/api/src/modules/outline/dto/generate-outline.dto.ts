import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class GenerateOutlineDto {
  @IsMongoId()
  blueprintId: string;

  @IsOptional()
  @IsString()
  generatedBy?: string;
}