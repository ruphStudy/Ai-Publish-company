import { Injectable } from '@nestjs/common';
import { CoverPromptTemplateManager } from './cover-prompt-template.manager';

@Injectable()
export class CoverPromptBuilder {
  constructor(
    private readonly templateManager: CoverPromptTemplateManager,
  ) {}

  buildFrontPrompt(style: Record<string, unknown>): string {
    return `Professional book front cover for "${style.title}", ${style.subtitle ? `subtitle "${style.subtitle}",` : ''} ${style.genre}, visual theme: ${style.visualTheme}, art style: ${style.artStyle}, illustration style: ${style.illustrationStyle}, color palette: ${(style.colorPalette as string[]).join(', ')}, typography: ${style.typographyStyle}, layout: ${style.coverLayout}, designed for ${style.targetAudience}, premium publishing quality, clear title-safe area, vertical ${style.recommendedImageRatio} composition`;
  }

  buildBackPrompt(style: Record<string, unknown>): string {
    return `Professional book back cover matching the front cover, ${style.artStyle}, restrained visual continuation, clear space for description and barcode, color palette ${(style.colorPalette as string[]).join(', ')}, no readable body text, premium publishing layout`;
  }

  buildSpinePrompt(style: Record<string, unknown>): string {
    return `Professional book spine design matching "${style.title}", ${style.typographyStyle}, ${style.artStyle}, vertical spine composition, clean readable title placement, consistent color palette ${(style.colorPalette as string[]).join(', ')}`;
  }

  buildWrapPrompt(
    frontPrompt: string,
    backPrompt: string,
    spinePrompt: string,
  ): string {
    return `Full wrap paperback cover design. Front: ${frontPrompt}. Spine: ${spinePrompt}. Back: ${backPrompt}. Maintain seamless visual continuity across front, spine, and back.`;
  }

  buildThumbnailPrompt(style: Record<string, unknown>): string {
    return `High-impact book thumbnail for "${style.title}", bold readable title-safe area, ${style.visualTheme}, ${style.artStyle}, simple recognizable central visual, strong contrast, optimized for small online marketplace display`;
  }

  getNegativePrompt(): string {
    return this.templateManager.getNegativePrompt();
  }
}