import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { QualityIssueSeverity } from '../../quality-review/entities/quality-review.entity';
import { ContentImprovementStatus, ImprovementMode, ImprovementScope, ImprovementTargetType } from '../entities/content-improvement.entity';

export class CreateContentImprovementDto {
  @IsMongoId() projectId: string;
  @IsOptional() @IsMongoId() qualityReviewId?: string;
  @IsEnum(ImprovementTargetType) targetType: ImprovementTargetType;
  @IsString() targetId: string;
  @IsEnum(ImprovementScope) scope: ImprovementScope;
  @IsEnum(ImprovementMode) mode: ImprovementMode;
  @IsOptional() @IsEnum(QualityIssueSeverity) minimumSeverity: QualityIssueSeverity = QualityIssueSeverity.INFO;
  @IsOptional() @IsString() instruction?: string;
  @IsOptional() @IsString() createdBy?: string;
}
export class ContentImprovementQueryDto {
  @IsOptional() @IsMongoId() projectId?: string;
  @IsOptional() @IsString() targetId?: string;
  @IsOptional() @IsEnum(ContentImprovementStatus) status?: ContentImprovementStatus;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page = 1;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit = 20;
}
