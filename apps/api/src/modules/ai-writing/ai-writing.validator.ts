import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class AIWritingValidator {
  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint || blueprint.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book blueprints can generate content',
      );
    }
  }

  validateOutline(outline: Record<string, unknown>): void {
    if (!outline || outline.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved outlines can generate content',
      );
    }
  }

  validateChapter(chapter: Record<string, unknown>): void {
    if (!chapter || chapter.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved chapter blueprints can generate content',
      );
    }
  }

  validateProjectState(
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    chapter: Record<string, unknown>,
  ): void {
    if (
      String(blueprint.projectId) !== String(outline.projectId) ||
      String(blueprint.projectId) !== String(chapter.projectId)
    ) {
      throw new BadRequestException(
        'Blueprint, outline, and chapter must belong to the same project',
      );
    }
  }
}