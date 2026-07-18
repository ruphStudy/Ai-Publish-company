import { BadRequestException, Injectable } from '@nestjs/common';
import { BookBlueprintStatus } from '../book-blueprint/entities/book-blueprint.entity';
import { OutlineStatus } from './entities/outline.entity';

@Injectable()
export class OutlineValidator {
  validateBlueprint(blueprint: Record<string, unknown>): void {
    if (!blueprint) {
      throw new BadRequestException('Book blueprint was not found');
    }

    if (blueprint.status !== BookBlueprintStatus.APPROVED) {
      throw new BadRequestException(
        'Only approved book blueprints can generate an outline',
      );
    }

    if (!blueprint.projectId || !blueprint.title) {
      throw new BadRequestException('Book blueprint is incomplete');
    }
  }

  validateUpdate(
    currentStatus: OutlineStatus,
    requestedStatus?: OutlineStatus,
  ): void {
    if (currentStatus === OutlineStatus.LOCKED) {
      throw new BadRequestException('Locked outlines cannot be updated');
    }

    if (
      requestedStatus === OutlineStatus.GENERATING ||
      requestedStatus === OutlineStatus.PENDING
    ) {
      throw new BadRequestException('Invalid outline status update');
    }
  }
}
