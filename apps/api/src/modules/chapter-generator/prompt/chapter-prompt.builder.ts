import { Injectable } from '@nestjs/common';
import { ChapterPromptTemplateManager } from './chapter-prompt-template.manager';

@Injectable()
export class ChapterPromptBuilder {
  constructor(
    private readonly templateManager: ChapterPromptTemplateManager,
  ) {}

  build(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapterOutline: Record<string, unknown>,
  ): string {
    return `${this.templateManager.getInstructions()}

Approved Book Blueprint:
${JSON.stringify({
  projectId: blueprint.projectId,
  title: blueprint.title,
  objective: blueprint.objective,
  genre: blueprint.genre,
  niche: blueprint.niche,
  microNiche: blueprint.microNiche,
  targetAudience: blueprint.targetAudience,
  writingStyle: blueprint.writingStyle,
  tone: blueprint.tone,
  language: blueprint.language,
})}

Approved Book Outline:
${JSON.stringify({
  outlineId: outline._id ?? outline.id,
  title: outline.title,
  outlineSummary: outline.outlineSummary,
})}

Chapter Outline:
${JSON.stringify(chapterOutline)}`;
  }
}