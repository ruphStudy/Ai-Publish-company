import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { ExportModule } from '../export/export.module';
import { PublishingWorkflowModule } from '../publishing-workflow/publishing-workflow.module';
import { Draft2DigitalSubmissionChecklistBuilder } from './draft2digital-checklist.builder';
import { Draft2DigitalController } from './draft2digital.controller';
import { Draft2DigitalErrorMapper } from './draft2digital-error.mapper';
import { Draft2DigitalMetadataMapper } from './draft2digital-metadata.mapper';
import { Draft2DigitalPackageBuilder } from './draft2digital-package.builder';
import { Draft2DigitalPublishingProvider } from './draft2digital-publishing.provider';
import { Draft2DigitalRepository } from './draft2digital.repository';
import { Draft2DigitalManualSubmissionService } from './draft2digital.service';
import { Draft2DigitalStatusMapper } from './draft2digital-status.mapper';
import { Draft2DigitalValidator } from './draft2digital.validator';
import { Draft2DigitalPackage, Draft2DigitalPackageSchema } from './entities/draft2digital.entity';

@Module({ imports: [MongooseModule.forFeature([{ name: Draft2DigitalPackage.name, schema: Draft2DigitalPackageSchema }]), BookMetadataModule, ExportModule, PublishingWorkflowModule], controllers: [Draft2DigitalController], providers: [Draft2DigitalManualSubmissionService, Draft2DigitalRepository, Draft2DigitalPublishingProvider, Draft2DigitalMetadataMapper, Draft2DigitalPackageBuilder, Draft2DigitalValidator, Draft2DigitalSubmissionChecklistBuilder, Draft2DigitalStatusMapper, Draft2DigitalErrorMapper], exports: [Draft2DigitalPublishingProvider, Draft2DigitalManualSubmissionService, Draft2DigitalRepository] })
export class Draft2DigitalModule {}
