import { Injectable } from '@nestjs/common';
import { GeneratedOutlinePayload } from './parsers/outline-response.parser';

@Injectable()
export class OutlineGenerationEngine {
  normalize(payload: GeneratedOutlinePayload): GeneratedOutlinePayload {
    const chapters = payload.chapters
      .sort((left, right) => left.chapterNumber - right.chapterNumber)
      .map((chapter, index) => ({
        ...chapter,
        chapterNumber: index + 1,
        partNumber: Math.max(1, Math.floor(chapter.partNumber)),
        partTitle: chapter.partTitle.trim(),
        chapterTitle: chapter.chapterTitle.trim(),
        objective: chapter.objective.trim(),
        summary: chapter.summary.trim(),
        estimatedWordCount: Math.max(1, Math.floor(chapter.estimatedWordCount)),
        writingInstructions: chapter.writingInstructions.trim(),
      }));

    return {
      ...payload,
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim(),
      outlineSummary: payload.outlineSummary.trim(),
      confidenceScore: Math.min(100, Math.max(0, payload.confidenceScore)),
      chapters,
    };
  }
}