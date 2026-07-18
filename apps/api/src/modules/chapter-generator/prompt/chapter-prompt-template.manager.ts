import { Injectable } from '@nestjs/common';
import { chapterGeneratorConfig } from '../config/chapter-generator.config';

@Injectable()
export class ChapterPromptTemplateManager {
  getVersion(): string {
    return chapterGeneratorConfig.generation.promptVersion;
  }

  getInstructions(): string {
    return `Create a structured chapter blueprint only. Do not write final book content. Return valid JSON only using this exact structure:
{
  "chapterTitle": "string",
  "objective": "string",
  "summary": "string",
  "introduction": "string",
  "conclusion": "string",
  "estimatedWordCount": 1000,
  "writingInstructions": "string",
  "keyConcepts": ["string"],
  "examples": ["string"],
  "references": ["string"],
  "dependencies": [1],
  "confidenceScore": 0,
  "sections": [
    {
      "sectionNumber": "1.1",
      "title": "string",
      "objective": "string",
      "summary": "string",
      "estimatedWordCount": 500,
      "writingInstructions": "string",
      "order": 1,
      "subsections": [
        {
          "sectionNumber": "1.1.1",
          "title": "string",
          "objective": "string",
          "summary": "string",
          "estimatedWordCount": 250,
          "writingInstructions": "string",
          "order": 1
        }
      ]
    }
  ]
}`;
  }
}