import { Injectable } from '@nestjs/common';
import { OutlinePromptTemplateManager } from './outline-prompt-template.manager';

@Injectable()
export class OutlinePromptBuilder {
  constructor(
    private readonly templateManager: OutlinePromptTemplateManager,
  ) {}

  build(blueprint: Record<string, unknown>): string {
    const blueprintPayload = {
      blueprintId: blueprint._id ?? blueprint.id,
      projectId: blueprint.projectId,
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
      chapterObjectives: blueprint.chapterObjectives,
      seoKeywords: blueprint.seoKeywords,
      primaryCategory: blueprint.primaryCategory,
      secondaryCategory: blueprint.secondaryCategory,
      metadata: blueprint.metadata,
    };

    return `${this.templateManager.getInstructions()}

Approved Book Blueprint:
${JSON.stringify(blueprintPayload)}`;
  }
}