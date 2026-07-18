import { Injectable } from '@nestjs/common';
import { tableOfContentsConfig } from './config/table-of-contents.config';
import {
  TableOfContents} from './entities/table-of-contents.entity';
import {
  TableOfContentsStatus,
} from './entities/table-of-contents.entity';

@Injectable()
export class TOCFactory {
  create(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    metadata: Record<string, unknown>,
    generated: Record<string, unknown>,
    generatedBy?: string,
  ): Partial<TableOfContents> {
    return {
      tocId: this.createTocId(),
      projectId: String(project._id ?? project.id),
      blueprintId: String(blueprint._id ?? blueprint.id),
      metadataId: String(metadata._id ?? metadata.id),
      title: String(metadata.title ?? blueprint.title),
      totalParts: Number(generated.totalParts),
      totalChapters: Number(generated.totalChapters),
      totalSections: Number(generated.totalSections),
      estimatedPages: Number(generated.estimatedPages),
      estimatedReadingTime: Number(generated.estimatedReadingTime),
      navigationTree: generated.navigationTree as [],
      tocItems: generated.tocItems as [],
      pdfBookmarks: generated.pdfBookmarks as Record<string, unknown>[],
      epubNavigation: generated.epubNavigation as Record<string, unknown>[],
      docxNavigation: generated.docxNavigation as Record<string, unknown>[],
      confidenceScore: Number(generated.confidenceScore),
      tocVersion: tableOfContentsConfig.tocVersion,
      status: TableOfContentsStatus.GENERATED,
      metadata: {
        generatedAt: new Date().toISOString(),
        metadataVersion: metadata.metadataVersion,
        blueprintVersion: blueprint.blueprintVersion,
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createTocId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `TOC-${date}-${suffix}`;
  }
}