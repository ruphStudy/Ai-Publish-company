import { BadRequestException, Injectable } from '@nestjs/common';
import { BookMetadataStatus } from './entities/book-metadata.entity';

@Injectable()
export class MetadataValidator {
  validateProject(project: Record<string, unknown>): void {
    if (!project || project.isDeleted) {
      throw new BadRequestException('Book project was not found');
    }
  }

  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint || blueprint.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book blueprints can generate metadata',
      );
    }
  }

  validateOutline(outline: Record<string, unknown>): void {
    if (!outline || outline.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved outlines can generate metadata',
      );
    }
  }

  validateProjectState(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
  ): void {
    if (
      String(project._id ?? project.id) !== String(blueprint.projectId) ||
      String(project._id ?? project.id) !== String(outline.projectId)
    ) {
      throw new BadRequestException(
        'Project, blueprint, and outline must belong to the same project',
      );
    }
  }

  validateContent(contents: Record<string, unknown>[]): void {
    if (!contents.length) {
      throw new BadRequestException(
        'Generated manuscript content is required for metadata generation',
      );
    }
  }

  validateUpdate(status: BookMetadataStatus): void {
    if (status === BookMetadataStatus.LOCKED) {
      throw new BadRequestException('Locked metadata cannot be updated');
    }
  }
}