import { BadRequestException, Injectable } from '@nestjs/common';
import { CoverPromptStatus } from './entities/cover-prompt.entity';

@Injectable()
export class CoverPromptValidator {
  validateProject(project: Record<string, unknown>): void {
    if (!project || project.isDeleted) {
      throw new BadRequestException('Book project was not found');
    }
  }

  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint || blueprint.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book blueprints can generate cover prompts',
      );
    }
  }

  validateOutline(outline: Record<string, unknown>): void {
    if (!outline || outline.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved outlines can generate cover prompts',
      );
    }
  }

  validateMetadata(metadata: Record<string, unknown>): void {
    if (!metadata || metadata.status !== 'APPROVED') {
      throw new BadRequestException(
        'Only approved book metadata can generate cover prompts',
      );
    }
  }

  validateProjectState(
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

  validateUpdate(status: CoverPromptStatus): void {
    if (status === CoverPromptStatus.LOCKED) {
      throw new BadRequestException('Locked cover prompts cannot be updated');
    }
  }
}