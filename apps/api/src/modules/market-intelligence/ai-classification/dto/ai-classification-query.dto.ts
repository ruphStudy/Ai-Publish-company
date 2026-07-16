import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  ClassificationCompetitionLevel,
  ClassificationDemandLevel,
  ClassificationMarketMaturity,
  ClassificationTopicType,
} from '../models/classification-result.model';

export class AIClassificationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryCategory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  niche?: string;

  @ApiPropertyOptional({ enum: ClassificationDemandLevel })
  @IsOptional()
  @IsEnum(ClassificationDemandLevel)
  demandLevel?: ClassificationDemandLevel;

  @ApiPropertyOptional({ enum: ClassificationCompetitionLevel })
  @IsOptional()
  @IsEnum(ClassificationCompetitionLevel)
  competitionLevel?: ClassificationCompetitionLevel;

  @ApiPropertyOptional({ enum: ClassificationMarketMaturity })
  @IsOptional()
  @IsEnum(ClassificationMarketMaturity)
  marketMaturity?: ClassificationMarketMaturity;

  @ApiPropertyOptional({ enum: ClassificationTopicType })
  @IsOptional()
  @IsEnum(ClassificationTopicType)
  topicType?: ClassificationTopicType;

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

  @ApiPropertyOptional({ default: 'classifiedAt' })
  @IsOptional()
  @IsIn(['classifiedAt', 'confidenceScore', 'createdAt', 'updatedAt'])
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