import { Injectable } from '@nestjs/common';
import { aiWritingConfig } from '../config/ai-writing.config';

@Injectable()
export class AIWritingPromptTemplateManager {
  getVersion(): string {
    return aiWritingConfig.generation.promptVersion;
  }

  getChapterInstructions(): string {
    return `Generate complete publication-ready chapter content in Markdown. Maintain the requested writing style, tone, terminology, narrative continuity, and target audience. Include a compelling introduction, smooth transitions, practical examples, useful tips, all requested sections and subsections, and a conclusion. Return Markdown only.`;
  }

  getSectionInstructions(): string {
    return `Generate only the requested section in publication-ready Markdown. Preserve the supplied chapter tone, style, terminology, and continuity. Return Markdown only.`;
  }
}