import { Injectable } from '@nestjs/common';
import { AIWritingPromptTemplateManager } from './ai-writing-prompt-template.manager';

@Injectable()
export class AIWritingPromptBuilder {
  constructor(
    private readonly templateManager: AIWritingPromptTemplateManager,
  ) {}

  buildChapterPrompt(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapter: Record<string, unknown>,
    instruction?: string,
  ): string {
    return `${this.templateManager.getChapterInstructions()}

Book Blueprint:
${JSON.stringify({
  title: blueprint.title,
  objective: blueprint.objective,
  targetAudience: blueprint.targetAudience,
  language: blueprint.language,
  writingStyle: blueprint.writingStyle,
  tone: blueprint.tone,
  niche: blueprint.niche,
})}

Book Outline:
${JSON.stringify({
  title: outline.title,
  outlineSummary: outline.outlineSummary,
})}

Approved Chapter Blueprint:
${JSON.stringify({
  chapterNumber: chapter.chapterNumber,
  chapterTitle: chapter.chapterTitle,
  objective: chapter.objective,
  summary: chapter.summary,
  writingInstructions: chapter.writingInstructions,
  keyConcepts: chapter.keyConcepts,
  examples: chapter.examples,
  references: chapter.references,
  dependencies: chapter.dependencies,
  sections: chapter.sections,
})}

Additional Instruction:
${instruction ?? 'Generate complete chapter content according to the chapter blueprint.'}`;
  }

  buildSectionPrompt(
    content: Record<string, unknown>,
    section: Record<string, unknown>,
    instruction?: string,
  ): string {
    return `${this.templateManager.getSectionInstructions()}

Chapter Context:
${JSON.stringify({
  chapterTitle: content.chapterTitle,
  generatedContent: content.generatedContent,
  metadata: content.metadata,
})}

Section Blueprint:
${JSON.stringify(section)}

Additional Instruction:
${instruction ?? 'Regenerate this section while preserving chapter consistency.'}`;
  }
}