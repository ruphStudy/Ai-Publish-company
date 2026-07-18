import { Injectable } from '@nestjs/common';
import { coverPromptConfig } from './config/cover-prompt.config';
import {
  CoverPrompt} from './entities/cover-prompt.entity';
import {
  CoverPromptStatus,
} from './entities/cover-prompt.entity';

@Injectable()
export class CoverPromptFactory {
  create(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    metadata: Record<string, unknown>,
    generated: Record<string, unknown>,
    generatedBy?: string,
  ): Partial<CoverPrompt> {
    return {
      promptId: this.createPromptId(),
      projectId: String(project._id ?? project.id),
      blueprintId: String(blueprint._id ?? blueprint.id),
      metadataId: String(metadata._id ?? metadata.id),
      title: String(generated.title),
      subtitle: generated.subtitle ? String(generated.subtitle) : undefined,
      visualTheme: String(generated.visualTheme),
      artStyle: String(generated.artStyle),
      colorPalette: generated.colorPalette as string[],
      typographyStyle: String(generated.typographyStyle),
      coverLayout: String(generated.coverLayout),
      illustrationStyle: String(generated.illustrationStyle),
      frontCoverPrompt: String(generated.frontCoverPrompt),
      backCoverPrompt: String(generated.backCoverPrompt),
      spinePrompt: String(generated.spinePrompt),
      wrapCoverPrompt: String(generated.wrapCoverPrompt),
      thumbnailPrompt: String(generated.thumbnailPrompt),
      negativePrompt: String(generated.negativePrompt),
      designVariations: generated.designVariations as Record<string, unknown>[],
      providerPromptOptions: generated.providerPromptOptions as Record<
        string,
        Record<string, string>
      >,
      recommendedImageRatio: String(generated.recommendedImageRatio),
      recommendedResolution: String(generated.recommendedResolution),
      confidenceScore: Number(generated.confidenceScore),
      promptVersion: coverPromptConfig.promptVersion,
      status: CoverPromptStatus.GENERATED,
      metadata: {
        generatedAt: new Date().toISOString(),
        metadataVersion: metadata.metadataVersion,
        blueprintVersion: blueprint.blueprintVersion,
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createPromptId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `CVP-${date}-${suffix}`;
  }
}