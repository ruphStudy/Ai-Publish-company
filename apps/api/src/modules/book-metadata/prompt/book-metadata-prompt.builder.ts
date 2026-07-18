import { Injectable } from '@nestjs/common';
import { BookMetadataPromptTemplateManager } from './book-metadata-prompt-template.manager';

@Injectable()
export class BookMetadataPromptBuilder {
  constructor(
    private readonly templateManager: BookMetadataPromptTemplateManager,
  ) {}

  build(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    contents: Record<string, unknown>[],
    instruction?: string,
  ): string {
    return `${this.templateManager.getInstructions()}

Book Project:
${JSON.stringify({
  projectCode: project.projectCode,
  title: project.title,
  language: project.language,
  targetMarket: project.targetMarket,
  targetAudience: project.targetAudience,
  tags: project.tags,
})}

Book Blueprint:
${JSON.stringify({
  title: blueprint.title,
  subtitle: blueprint.subtitle,
  objective: blueprint.objective,
  usp: blueprint.usp,
  genre: blueprint.genre,
  niche: blueprint.niche,
  targetAudience: blueprint.targetAudience,
  language: blueprint.language,
  seoKeywords: blueprint.seoKeywords,
  primaryCategory: blueprint.primaryCategory,
  secondaryCategory: blueprint.secondaryCategory,
})}

Book Outline:
${JSON.stringify({
  title: outline.title,
  outlineSummary: outline.outlineSummary,
  totalChapters: outline.totalChapters,
})}

Generated Manuscript:
${JSON.stringify(
  contents.map((content) => ({
    chapterNumber: content.chapterNumber,
    chapterTitle: content.chapterTitle,
    plainTextContent: content.plainTextContent,
  })),
)}

Additional Instruction:
${instruction ?? 'Generate marketplace-compliant SEO-optimized publishing metadata.'}`;
  }
}