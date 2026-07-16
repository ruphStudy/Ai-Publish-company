import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import {
  OpportunityGrade,
  OpportunityRecommendation,
} from '../models/opportunity-score.model';

export class OpportunityScoreQueryDto {
  @ApiPropertyOptional({ enum: OpportunityGrade })
  @IsOptional()
  @IsEnum(OpportunityGrade)
  opportunityGrade?: OpportunityGrade;

  @ApiPropertyOptional({ enum: OpportunityRecommendation })
  @IsOptional()
  @IsEnum(OpportunityRecommendation)
  recommendation?: OpportunityRecommendation;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minOverallScore?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  maxOverallScore?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minConfidenceScore?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  maxConfidenceScore?: number;

  @ApiPropertyOptional({
    enum: ['overallScore', 'confidenceScore', 'scoredAt', 'createdAt', 'updatedAt'],
    default: 'overallScore',
  })
  @IsOptional()
  @IsIn(['overallScore', 'confidenceScore', 'scoredAt', 'createdAt', 'updatedAt'])
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}