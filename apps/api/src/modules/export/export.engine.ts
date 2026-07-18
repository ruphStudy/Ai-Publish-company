import { Injectable } from '@nestjs/common';
import { ExportContentSource, ExportManuscript, ExportMetadataSource, ExportTocSource } from './interfaces/export-provider.interface';

@Injectable()
export class ExportEngine {
  assemble(
    metadata: ExportMetadataSource,
    toc: ExportTocSource,
    contents: ExportContentSource[],
  ): ExportManuscript {
    return {
      title: metadata.title,
      authorName: metadata.authorName,
      publisherName: metadata.publisherName,
      copyrightText: metadata.copyrightText,
      tocItems: toc.tocItems,
      chapters: contents
        .sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))
        .map((content) => ({
          chapterNumber: content.chapterNumber,
          chapterTitle: content.chapterTitle,
          markdownContent: content.markdownContent,
          htmlContent: content.htmlContent,
        })),
    };
  }
}
