import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { PublicationReadiness, QualityReviewStatus } from '../entities/quality-review.entity';

export class CreateQualityReviewDto {
  @IsMongoId()
  projectId: string;

  @IsMongoId()
  blueprintId: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}

export class UpdateQualityReviewDto {
  @IsOptional()
  @IsEnum(QualityReviewStatus)
  status?: QualityReviewStatus;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class QualityReviewQueryDto {
  @IsOptional()
  @IsMongoId()
  projectId?: string;

  @IsOptional()
  @IsEnum(QualityReviewStatus)
  status?: QualityReviewStatus;

  @IsOptional()
  @IsEnum(PublicationReadiness)
  publicationReadiness?: PublicationReadiness;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit = 20;
}
