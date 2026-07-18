import { Injectable } from '@nestjs/common';
import { CoverPromptDocument } from './entities/cover-prompt.entity';

@Injectable()
export class CoverPromptMapper {
  toResponse(document: CoverPromptDocument) {
    return {
      id: document.id,
      promptId: document.promptId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      metadataId: document.metadataId,
      title: document.title,
      subtitle: document.subtitle,
      visualTheme: document.visualTheme,
      artStyle: document.artStyle,
      colorPalette: document.colorPalette,
      typographyStyle: document.typographyStyle,
      coverLayout: document.coverLayout,
      illustrationStyle: document.illustrationStyle,
      frontCoverPrompt: document.frontCoverPrompt,
      backCoverPrompt: document.backCoverPrompt,
      spinePrompt: document.spinePrompt,
      wrapCoverPrompt: document.wrapCoverPrompt,
      thumbnailPrompt: document.thumbnailPrompt,
      negativePrompt: document.negativePrompt,
      designVariations: document.designVariations,
      providerPromptOptions: document.providerPromptOptions,
      recommendedImageRatio: document.recommendedImageRatio,
      recommendedResolution: document.recommendedResolution,
      confidenceScore: document.confidenceScore,
      promptVersion: document.promptVersion,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}