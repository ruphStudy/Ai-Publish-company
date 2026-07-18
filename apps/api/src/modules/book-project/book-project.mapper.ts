import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import type { BookProjectResponseDto } from './dto';
import { BookProject } from './entities/book-project.entity';

@Injectable()
export class BookProjectMapper {
  toResponse(project: BookProject): BookProjectResponseDto {
    return {
      id: (project._id as Types.ObjectId).toString(),
      projectCode: project.projectCode,
      title: project.title,
      subtitle: project.subtitle,
      description: project.description,
      categoryId: (project.categoryId as Types.ObjectId).toString(),
      subCategoryId: project.subCategoryId
        ? (project.subCategoryId as Types.ObjectId).toString()
        : null,
      niche: project.niche,
      microNiche: project.microNiche,
      language: project.language,
      targetMarket: project.targetMarket,
      targetAudience: project.targetAudience,
      writingStyle: project.writingStyle,
      tone: project.tone,
      objective: project.objective,
      estimatedWordCount: project.estimatedWordCount,
      estimatedChapterCount: project.estimatedChapterCount,
      targetPlatforms: project.targetPlatforms,
      aiModel: project.aiModel,
      status: project.status,
      progress: project.progress,
      currentStage: project.currentStage,
      ownerId: (project.ownerId as Types.ObjectId).toString(),
      tags: project.tags,
      metadata: project.metadata,
      version: project.version,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}