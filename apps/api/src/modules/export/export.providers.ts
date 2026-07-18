import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import archiver from 'archiver';
import { PassThrough } from 'stream';
import { ExportFormat } from './entities/export-artifact.entity';
import {
  ExportManuscript,
  ExportProvider,
  GeneratedExportFile,
} from './interfaces/export-provider.interface';

@Injectable()
export class PdfExportProvider implements ExportProvider {
  readonly format = ExportFormat.PDF;

  generate(manuscript: ExportManuscript): Promise<GeneratedExportFile> {
    return new Promise((resolve, reject) => {
      const document = new PDFDocument({ autoFirstPage: true, margin: 54 });
      const chunks: Buffer[] = [];
      document.on('data', (chunk: Buffer) => chunks.push(chunk));
      document.on('error', reject);
      document.on('end', () =>
        resolve({
          format: this.format,
          filename: `${this.slug(manuscript.title)}.pdf`,
          mimeType: 'application/pdf',
          buffer: Buffer.concat(chunks),
        }),
      );

      document.fontSize(28).text(manuscript.title, { align: 'center' });
      document.moveDown();
      if (manuscript.authorName) document.fontSize(14).text(manuscript.authorName, { align: 'center' });
      document.addPage().fontSize(16).text('Table of Contents');
      manuscript.tocItems.forEach((item) => document.fontSize(12).text(`${item.number} ${item.title}`));
      manuscript.chapters.forEach((chapter) => {
        document.addPage().fontSize(20).text(`${chapter.chapterNumber}. ${chapter.chapterTitle}`);
        document.moveDown().fontSize(11).text(
          chapter.markdownContent.replace(/[#*_`]/g, ''),
          { lineGap: 4 },
        );
      });
      document.end();
    });
  }

  private slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}

@Injectable()
export class PrintPdfExportProvider implements ExportProvider {
  readonly format = ExportFormat.PRINT_PDF;

  constructor(private readonly pdfProvider: PdfExportProvider) {}

  async generate(manuscript: ExportManuscript): Promise<GeneratedExportFile> {
    const file = await this.pdfProvider.generate(manuscript);

    return {
      ...file,
      format: this.format,
      filename: file.filename.replace('.pdf', '-print.pdf'),
    };
  }
}

@Injectable()
export class EpubExportProvider implements ExportProvider {
  readonly format = ExportFormat.EPUB;

  async generate(manuscript: ExportManuscript): Promise<GeneratedExportFile> {
    const Epub = require('epub-gen');
    const temporaryPath = require('path').join(
      require('os').tmpdir(),
      `${Date.now()}-${Math.random()}.epub`,
    );

    await new Epub(
      {
        title: manuscript.title,
        author: manuscript.authorName ?? 'Unknown Author',
        publisher: manuscript.publisherName,
        version: 3,
        content: manuscript.chapters.map((chapter) => ({
          title: `${chapter.chapterNumber}. ${chapter.chapterTitle}`,
          data: chapter.htmlContent,
        })),
      },
      temporaryPath,
    ).promise;

    const buffer = await require('fs-extra').readFile(temporaryPath);
    await require('fs-extra').remove(temporaryPath);

    return {
      format: this.format,
      filename: `${manuscript.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.epub`,
      mimeType: 'application/epub+zip',
      buffer,
    };
  }
}

@Injectable()
export class DocxExportProvider implements ExportProvider {
  readonly format = ExportFormat.DOCX;

  async generate(manuscript: ExportManuscript): Promise<GeneratedExportFile> {
    const document = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: manuscript.title,
              heading: HeadingLevel.TITLE,
            }),
            ...manuscript.chapters.flatMap((chapter) => [
              new Paragraph({
                text: `${chapter.chapterNumber}. ${chapter.chapterTitle}`,
                heading: HeadingLevel.HEADING_1,
              }),
              ...chapter.markdownContent
                .split('\n')
                .filter(Boolean)
                .map(
                  (line) =>
                    new Paragraph({
                      children: [new TextRun(line.replace(/[#*_`]/g, ''))],
                    }),
                ),
            ]),
          ],
        },
      ],
    });

    return {
      format: this.format,
      filename: `${manuscript.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.docx`,
      mimeType:
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: await Packer.toBuffer(document),
    };
  }
}

@Injectable()
export class ZipExportProvider implements ExportProvider {
  readonly format = ExportFormat.ZIP;

  generate(manuscript: ExportManuscript): Promise<GeneratedExportFile> {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const output = new PassThrough();
      const chunks: Buffer[] = [];
      output.on('data', (chunk: Buffer) => chunks.push(chunk));
      output.on('end', () => resolve({
        format: this.format,
        filename: `${manuscript.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`,
        mimeType: 'application/zip',
        buffer: Buffer.concat(chunks),
      }));
      output.on('error', reject);
      archive.on('error', reject);
      archive.pipe(output);
      const manifest = {
        title: manuscript.title,
        author: manuscript.authorName,
        generatedAt: new Date().toISOString(),
        chapters: manuscript.chapters.map(({ chapterNumber, chapterTitle }) => ({ chapterNumber, chapterTitle })),
      };
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });
      for (const chapter of manuscript.chapters) {
        archive.append(chapter.htmlContent, { name: `chapters/${chapter.chapterNumber}.html` });
      }
      void archive.finalize();
    });
  }
}

@Injectable()
export class ExportProviderFactory {
  constructor(
    private readonly pdfProvider: PdfExportProvider,
    private readonly printPdfProvider: PrintPdfExportProvider,
    private readonly epubProvider: EpubExportProvider,
    private readonly docxProvider: DocxExportProvider,
    private readonly zipProvider: ZipExportProvider,
  ) {}

  getProvider(format: ExportFormat): ExportProvider {
    const providers: Record<ExportFormat, ExportProvider> = {
      [ExportFormat.PDF]: this.pdfProvider,
      [ExportFormat.PRINT_PDF]: this.printPdfProvider,
      [ExportFormat.EPUB]: this.epubProvider,
      [ExportFormat.DOCX]: this.docxProvider,
      [ExportFormat.ZIP]: this.zipProvider,
    };

    return providers[format];
  }
}

@Injectable()
export class CoverMergeEngine {
  merge(manuscript: ExportManuscript): ExportManuscript {
    return manuscript;
  }
}

@Injectable()
export class AssetPackagingEngine {
  async package(): Promise<void> {
    return;
  }
}
