import type { ExportFormat } from '../entities/export-artifact.entity';

export interface ExportManuscript {
  title: string;
  authorName?: string;
  publisherName?: string;
  copyrightText: string;
  tocItems: Array<{ level: number; number: string; title: string }>;
  chapters: Array<{
    chapterNumber: number;
    chapterTitle: string;
    markdownContent: string;
    htmlContent: string;
  }>;
}

export interface ExportMetadataSource {
  title: string;
  authorName?: string;
  publisherName?: string;
  copyrightText: string;
  status: string;
}

export interface ExportTocSource {
  status: string;
  tocItems: Array<{ level: number; number: string; title: string }>;
}

export interface ExportContentSource {
  chapterNumber: number;
  chapterTitle: string;
  markdownContent: string;
  htmlContent: string;
}

export interface GeneratedExportFile {
  format: ExportFormat;
  filename: string;
  mimeType: string;
  buffer: Buffer;
}

export interface ExportProvider {
  readonly format: ExportFormat;
  generate(manuscript: ExportManuscript): Promise<GeneratedExportFile>;
}
