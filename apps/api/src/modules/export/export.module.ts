import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { CoverPromptModule } from '../cover-prompt/cover-prompt.module';
import { TableOfContentsModule } from '../table-of-contents/table-of-contents.module';
import { ExportController } from './export.controller';
import { ExportEngine } from './export.engine';
import { ExportFactory } from './export.factory';
import { ExportMapper } from './export.mapper';
import { ExportPipeline } from './export.pipeline';
import {
  AssetPackagingEngine,
  CoverMergeEngine,
  DocxExportProvider,
  EpubExportProvider,
  ExportProviderFactory,
  PdfExportProvider,
  PrintPdfExportProvider,
  ZipExportProvider,
} from './export.providers';
import { ExportRepository } from './export.repository';
import { ExportService } from './export.service';
import { ExportStorageService } from './export-storage.service';
import { ExportValidator } from './export.validator';
import { ExportJob, ExportJobSchema } from './entities/export-job.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ExportJob.name,
        schema: ExportJobSchema,
      },
    ]),
    BookProjectModule,
    BookBlueprintModule,
    BookMetadataModule,
    TableOfContentsModule,
    CoverPromptModule,
    AIWritingModule,
  ],
  controllers: [ExportController],
  providers: [
    ExportService,
    ExportRepository,
    ExportEngine,
    ExportFactory,
    ExportValidator,
    ExportMapper,
    ExportPipeline,
    ExportStorageService,
    PdfExportProvider,
    PrintPdfExportProvider,
    EpubExportProvider,
    DocxExportProvider,
    ZipExportProvider,
    ExportProviderFactory,
    CoverMergeEngine,
    AssetPackagingEngine,
  ],
  exports: [ExportService, ExportRepository],
})
export class ExportModule {}
