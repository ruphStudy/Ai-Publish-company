import { BadRequestException, Injectable } from '@nestjs/common';
import { TableOfContentsStatus } from './entities/table-of-contents.entity';

@Injectable()
export class TOCValidator {
  validateProject(project: Record<string, unknown>): void {
    if (!project || project.isDeleted) {
      throw new BadRequestException('Book project was not found');
    }
  }

  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint || blueprint.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book blueprints can generate a table of contents',
      );
    }
  }

  validateOutline(outline: Record<string, unknown>): void {
    if (!outline || outline.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved outlines can generate a table of contents',
      );
    }
  }

  validateMetadata(metadata: Record<string, unknown>): void {
    if (!metadata || metadata.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book metadata can generate a table of contents',
      );
    }
  }

  validateContents(contents: Record<string, unknown>[]): void {
    if (!contents.length) {
      throw new BadRequestException(
        'Generated manuscript content is required for TOC generation',
      );
    }

    const chapterNumbers = contents.map((item) => Number(item.chapterNumber));
    const ordered = [...chapterNumbers].sort((left, right) => left - right);

    if (ordered.some((value, index) => value !== index + 1)) {
      throw new BadRequestException(
        'Generated chapter content must have sequential chapter numbering',
      );
    }
  }

  validateState(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    metadata: Record<string, unknown>,
  ): void {
    const projectId = String(project._id ?? project.id);

    if (
      projectId !== String(blueprint.projectId) ||
      projectId !== String(outline.projectId) ||
      projectId !== String(metadata.projectId)
    ) {
      throw new BadRequestException(
        'Project, blueprint, outline, and metadata must belong to the same project',
      );
    }
  }

  validateUpdate(status: TableOfContentsStatus): void {
    if (status === TableOfContentsStatus.LOCKED) {
      throw new BadRequestException('Locked table of contents cannot be updated');
    }
  }
}