import { Injectable } from '@nestjs/common';
import { OutlineService } from '../../../modules/outline/outline.service';
import { ChapterGeneratorService } from '../../../modules/chapter-generator/chapter-generator.service';
import { AIWritingService } from '../../../modules/ai-writing/ai-writing.service';
import { BookMetadataService } from '../../../modules/book-metadata/book-metadata.service';
import { CoverPromptService } from '../../../modules/cover-prompt/cover-prompt.service';
import { TableOfContentsService } from '../../../modules/table-of-contents/table-of-contents.service';
import { ExportService } from '../../../modules/export/export.service';
import {
  ChapterGenerationCommand, ContentGenerationCommand, CoverPromptGenerationCommand,
  ExportCreationCommand, MetadataGenerationCommand, OutlineGenerationCommand,
  TableOfContentsGenerationCommand,
} from './publishing-workflow.models';

@Injectable()
export class PublishingWorkflowOrchestrator {
  constructor(
    private readonly outlines: OutlineService,
    private readonly chapters: ChapterGeneratorService,
    private readonly writing: AIWritingService,
    private readonly metadata: BookMetadataService,
    private readonly covers: CoverPromptService,
    private readonly tablesOfContents: TableOfContentsService,
    private readonly exports: ExportService,
  ) {}

  generateOutline(command: OutlineGenerationCommand) { return this.outlines.generate(command); }
  generateChapter(command: ChapterGenerationCommand) { return this.chapters.generate(command); }
  generateContent(command: ContentGenerationCommand) { return this.writing.generate(command); }
  generateMetadata(command: MetadataGenerationCommand) { return this.metadata.generate(command); }
  generateCoverPrompt(command: CoverPromptGenerationCommand) { return this.covers.generate(command); }
  generateTableOfContents(command: TableOfContentsGenerationCommand) { return this.tablesOfContents.generate(command); }
  createExport(command: ExportCreationCommand) { return this.exports.create(command); }
}
