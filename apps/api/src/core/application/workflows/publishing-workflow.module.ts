import { Module } from '@nestjs/common';
import { AIWritingModule } from '../../../modules/ai-writing/ai-writing.module';
import { BookMetadataModule } from '../../../modules/book-metadata/book-metadata.module';
import { ChapterGeneratorModule } from '../../../modules/chapter-generator/chapter-generator.module';
import { CoverPromptModule } from '../../../modules/cover-prompt/cover-prompt.module';
import { ExportModule } from '../../../modules/export/export.module';
import { OutlineModule } from '../../../modules/outline/outline.module';
import { TableOfContentsModule } from '../../../modules/table-of-contents/table-of-contents.module';
import { PublishingWorkflowOrchestrator } from './publishing-workflow.orchestrator';

@Module({
  imports: [OutlineModule, ChapterGeneratorModule, AIWritingModule, BookMetadataModule, CoverPromptModule, TableOfContentsModule, ExportModule],
  providers: [PublishingWorkflowOrchestrator],
  exports: [PublishingWorkflowOrchestrator],
})
export class PublishingWorkflowModule {}
