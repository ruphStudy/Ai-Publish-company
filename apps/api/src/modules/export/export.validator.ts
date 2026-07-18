import { BadRequestException, Injectable } from '@nestjs/common';
import { ExportContentSource, ExportMetadataSource, ExportTocSource } from './interfaces/export-provider.interface';

@Injectable()
export class ExportValidator {
  validate(
    project: object,
    blueprint: { status: string },
    metadata: ExportMetadataSource,
    toc: ExportTocSource,
    contents: ExportContentSource[],
  ): void {
    if (!project || !blueprint || !metadata || !toc) {
      throw new BadRequestException('Export source data is incomplete');
    }

    if (
      blueprint.status !== 'APPROVED' ||
      metadata.status !== 'APPROVED' ||
      toc.status !== 'APPROVED'
    ) {
      throw new BadRequestException(
        'Blueprint, metadata, and table of contents must be approved before export',
      );
    }

    if (!contents.length) {
      throw new BadRequestException('Generated manuscript content is required');
    }
  }
}
