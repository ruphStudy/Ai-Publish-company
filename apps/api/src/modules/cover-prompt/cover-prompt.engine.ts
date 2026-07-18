import { Injectable } from '@nestjs/common';
import { coverPromptConfig } from './config/cover-prompt.config';
import { CoverPromptBuilder } from './prompt/cover-prompt.builder';
import { StyleRecommendationEngine } from './style-recommendation.engine';

@Injectable()
export class CoverPromptEngine {
  constructor(
    private readonly styleEngine: StyleRecommendationEngine,
    private readonly promptBuilder: CoverPromptBuilder,
  ) {}

  generate(
    blueprint: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ) {
    const style = {
      ...this.styleEngine.generate(blueprint, metadata),
      recommendedImageRatio: coverPromptConfig.defaultImageRatio,
      recommendedResolution: coverPromptConfig.defaultResolution,
    };

    const frontCoverPrompt = this.promptBuilder.buildFrontPrompt(style);
    const backCoverPrompt = this.promptBuilder.buildBackPrompt(style);
    const spinePrompt = this.promptBuilder.buildSpinePrompt(style);

    return {
      ...style,
      frontCoverPrompt,
      backCoverPrompt,
      spinePrompt,
      wrapCoverPrompt: this.promptBuilder.buildWrapPrompt(
        frontCoverPrompt,
        backCoverPrompt,
        spinePrompt,
      ),
      thumbnailPrompt: this.promptBuilder.buildThumbnailPrompt(style),
      negativePrompt: this.promptBuilder.getNegativePrompt(),
      designVariations: this.createVariations(style),
      providerPromptOptions: this.createProviderOptions(frontCoverPrompt),
      confidenceScore: 88,
    };
  }

  private createVariations(style: Record<string, unknown>) {
    const variations = [
      {
        name: 'Minimal Editorial',
        artStyle: 'minimal premium editorial design',
        colorPalette: style.colorPalette,
        promptModifier: 'minimal composition, refined negative space',
      },
      {
        name: 'Cinematic Illustration',
        artStyle: 'cinematic high-detail digital illustration',
        colorPalette: style.colorPalette,
        promptModifier: 'dramatic lighting, immersive atmosphere',
      },
      {
        name: 'Modern Typography',
        artStyle: 'typography-led contemporary book design',
        colorPalette: style.colorPalette,
        promptModifier: 'strong type hierarchy, simple symbolic graphic',
      },
    ];

    return variations.slice(0, coverPromptConfig.variationCount);
  }

  private createProviderOptions(frontCoverPrompt: string) {
    return {
      openaiImages: {
        prompt: frontCoverPrompt,
      },
      stableDiffusion: {
        prompt: `${frontCoverPrompt}, highly detailed, professional book cover`,
      },
      flux: {
        prompt: `${frontCoverPrompt}, premium editorial composition`,
      },
      midjourney: {
        prompt: `${frontCoverPrompt} --ar 2:3 --stylize 250`,
      },
      ideogram: {
        prompt: `${frontCoverPrompt}, typography-safe composition`,
      },
      leonardo: {
        prompt: `${frontCoverPrompt}, publishing quality cover art`,
      },
      recraft: {
        prompt: `${frontCoverPrompt}, clean vector-editorial finish`,
      },
    };
  }
}