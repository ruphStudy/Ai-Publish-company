import { Injectable } from '@nestjs/common';
import { outlineConfig } from '../config/outline.config';

@Injectable()
export class OutlinePromptTemplateManager {
  getVersion(): string {
    return outlineConfig.generation.promptVersion;
  }

  getInstructions(): string {
    return `Generate a production-ready book outline from the supplied approved blueprint. Return valid JSON only. Use this exact structure:
{
  "title": "string",
  "subtitle": "string",
  "outlineSummary": "string",
  "confidenceScore": 0,
  "chapters": [
    {
      "partNumber": 1,
      "partTitle": "string",
      "chapterNumber": 1,
      "chapterTitle": "string",
      "objective": "string",
      "summary": "string",
      "estimatedWordCount": 1000,
      "keyTopics": ["string"],
      "learningOutcomes": ["string"],
      "writingInstructions": "string",
      "references": ["string"]
    }
  ]
}
Every chapter must be sequential. Generate complete part and chapter structure. Do not include markdown, explanations, or fields outside this JSON object.`;
  }
}