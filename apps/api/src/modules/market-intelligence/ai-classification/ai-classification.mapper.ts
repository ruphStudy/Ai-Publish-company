import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { AIClassificationResponseDto } from './dto';
import { AIClassification } from './entities/ai-classification.entity';
import { ClassificationResult } from './models/classification-result.model';

@Injectable()
export class AIClassificationMapper {
  toPersistence(result: ClassificationResult): ClassificationResult {
    return {
      ...result,
      aiTags: [...new Set(result.aiTags)],
    };
  }

  toResponse(record: AIClassification): AIClassificationResponseDto {
    return {
      id: (record._id as Types.ObjectId).toString(),
      knowledgeId: (record.knowledgeId as Types.ObjectId).toString(),
      primaryCategory: record.primaryCategory,
      secondaryCategory: record.secondaryCategory,
      niche: record.niche,
      microNiche: record.microNiche,
      targetAudience: record.targetAudience,
      contentType: record.contentType,
      writingStyle: record.writingStyle,
      complexity: record.complexity,
      demandLevel: record.demandLevel,
      competitionLevel: record.competitionLevel,
      marketMaturity: record.marketMaturity,
      topicType: record.topicType,
      commercialIntent: record.commercialIntent,
      educationalIntent: record.educationalIntent,
      evergreenScore: record.evergreenScore,
      seasonalScore: record.seasonalScore,
      aiTags: record.aiTags,
      confidenceScore: record.confidenceScore,
      classificationVersion: record.classificationVersion,
      classifiedAt: record.classifiedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }
}