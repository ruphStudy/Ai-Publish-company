import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { BookBlueprintResponseDto } from './dto';
import { BookBlueprint } from './entities/book-blueprint.entity';

@Injectable()
export class BookBlueprintMapper {
  toResponse(blueprint: BookBlueprint): BookBlueprintResponseDto {
    return {
      id: (blueprint._id as Types.ObjectId).toString(),
      blueprintId: blueprint.blueprintId,
      projectId: (blueprint.projectId as Types.ObjectId).toString(),
      marketIntelligenceId: (
        blueprint.marketIntelligenceId as Types.ObjectId
      ).toString(),
      knowledgeRecordId: (blueprint.knowledgeRecordId as Types.ObjectId).toString(),
      classificationId: (blueprint.classificationId as Types.ObjectId).toString(),
      opportunityScoreId: (
        blueprint.opportunityScoreId as Types.ObjectId
      ).toString(),
      title: blueprint.title,
      subtitle: blueprint.subtitle,
      objective: blueprint.objective,
      usp: blueprint.usp,
      genre: blueprint.genre,
      niche: blueprint.niche,
      microNiche: blueprint.microNiche,
      targetAudience: blueprint.targetAudience,
      readerPersona: blueprint.readerPersona,
      language: blueprint.language,
      writingStyle: blueprint.writingStyle,
      tone: blueprint.tone,
      estimatedWordCount: blueprint.estimatedWordCount,
      estimatedChapterCount: blueprint.estimatedChapterCount,
      targetPlatforms: blueprint.targetPlatforms,
      publishingStrategy: blueprint.publishingStrategy,
      seoKeywords: blueprint.seoKeywords,
      primaryCategory: blueprint.primaryCategory,
      secondaryCategory: blueprint.secondaryCategory,
      chapterObjectives: blueprint.chapterObjectives,
      monetizationStrategy: blueprint.monetizationStrategy,
      confidenceScore: blueprint.confidenceScore,
      blueprintVersion: blueprint.blueprintVersion,
      status: blueprint.status,
      metadata: blueprint.metadata,
      createdAt: blueprint.createdAt,
      updatedAt: blueprint.updatedAt,
    };
  }
}