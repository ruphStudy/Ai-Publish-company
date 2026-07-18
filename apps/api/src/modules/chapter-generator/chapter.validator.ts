import { BadRequestException, Injectable } from '@nestjs/common';
import { ChapterStatus } from './entities/chapter.entity';

@Injectable()
export class ChapterValidator {
  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint || blueprint.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book blueprints can generate chapter blueprints',
      );
    }
  }

  validateOutline(outline: Record<string, unknown>): void {
    if (!outline || outline.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved outlines can generate chapter blueprints',
      );
    }
  }

  validateChapterOutline(
    outline: Record<string, unknown>,
    chapterNumber: number,
  ): Record<string, unknown> {
    const chapters = Array.isArray(outline.chapters) ? outline.chapters : [];

    const chapter = chapters.find(
      (item) =>
        item &&
        typeof item === 'object' &&
        (item as Record<string, unknown>).chapterNumber === chapterNumber,
    );

    if (!chapter || typeof chapter !== 'object') {
      throw new BadRequestException(
        `Chapter ${chapterNumber} was not found in the approved outline`,
      );
    }

    return chapter as Record<string, unknown>;
  }

  validateUpdate(currentStatus: ChapterStatus): void {
    if (currentStatus === ChapterStatus.LOCKED) {
      throw new BadRequestException(
        'Locked chapter blueprints cannot be updated',
      );
    }
  }
}