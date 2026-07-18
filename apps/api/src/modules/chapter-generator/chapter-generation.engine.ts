import { Injectable } from '@nestjs/common';
import { GeneratedChapterBlueprint } from './parsers/chapter-response.parser';

@Injectable()
export class ChapterGenerationEngine {
  normalize(payload: GeneratedChapterBlueprint): GeneratedChapterBlueprint {
    return {
      ...payload,
      sections: payload.sections
        .sort((left, right) => left.order - right.order)
        .map((section, index) => ({
          ...section,
          order: index + 1,
          estimatedWordCount: Math.max(
            1,
            Math.floor(section.estimatedWordCount),
          ),
          subsections: (section.subsections ?? []).map(
            (subsection, subsectionIndex) => ({
              ...subsection,
              order: subsectionIndex + 1,
              estimatedWordCount: Math.max(
                1,
                Math.floor(subsection.estimatedWordCount),
              ),
            }),
          ),
        })),
    };
  }
}