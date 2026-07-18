import { Injectable } from '@nestjs/common';
import { TableOfContentsDocument } from './entities/table-of-contents.entity';

@Injectable()
export class TOCMapper {
  toResponse(document: TableOfContentsDocument) {
    return {
      id: document.id,
      tocId: document.tocId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      metadataId: document.metadataId,
      title: document.title,
      totalParts: document.totalParts,
      totalChapters: document.totalChapters,
      totalSections: document.totalSections,
      estimatedPages: document.estimatedPages,
      estimatedReadingTime: document.estimatedReadingTime,
      navigationTree: document.navigationTree,
      tocItems: document.tocItems,
      pdfBookmarks: document.pdfBookmarks,
      epubNavigation: document.epubNavigation,
      docxNavigation: document.docxNavigation,
      confidenceScore: document.confidenceScore,
      tocVersion: document.tocVersion,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}