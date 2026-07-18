import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { ExportModule } from '../export/export.module';
import { PublishingWorkflowModule } from '../publishing-workflow/publishing-workflow.module';
import { GooglePlayBooksSubmissionChecklistBuilder } from './google-play-books-checklist.builder';
import { GooglePlayBooksController } from './google-play-books.controller';
import { GooglePlayBooksErrorMapper } from './google-play-books-error.mapper';
import { GooglePlayBooksMetadataMapper } from './google-play-books-metadata.mapper';
import { GooglePlayBooksPackageBuilder } from './google-play-books-package.builder';
import { GooglePlayBooksPublishingProvider } from './google-play-books-publishing.provider';
import { GooglePlayBooksRepository } from './google-play-books.repository';
import { GooglePlayBooksManualSubmissionService } from './google-play-books.service';
import { GooglePlayBooksStatusMapper } from './google-play-books-status.mapper';
import { GooglePlayBooksValidator } from './google-play-books.validator';
import { GooglePlayBooksPackage, GooglePlayBooksPackageSchema } from './entities/google-play-books.entity';

@Module({ imports: [MongooseModule.forFeature([{ name: GooglePlayBooksPackage.name, schema: GooglePlayBooksPackageSchema }]), BookMetadataModule, ExportModule, PublishingWorkflowModule], controllers: [GooglePlayBooksController], providers: [GooglePlayBooksManualSubmissionService, GooglePlayBooksRepository, GooglePlayBooksPublishingProvider, GooglePlayBooksMetadataMapper, GooglePlayBooksPackageBuilder, GooglePlayBooksValidator, GooglePlayBooksSubmissionChecklistBuilder, GooglePlayBooksStatusMapper, GooglePlayBooksErrorMapper], exports: [GooglePlayBooksPublishingProvider, GooglePlayBooksManualSubmissionService, GooglePlayBooksRepository] })
export class GooglePlayBooksModule {}
