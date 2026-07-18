import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { ExportModule } from '../export/export.module';
import { PublishingWorkflowModule } from '../publishing-workflow/publishing-workflow.module';
import { AmazonKdpPackage, AmazonKdpPackageSchema } from './entities/amazon-kdp.entity';
import { AmazonKdpSubmissionChecklistBuilder } from './amazon-kdp-checklist.builder';
import { AmazonKdpController } from './amazon-kdp.controller';
import { AmazonKdpErrorMapper } from './amazon-kdp-error.mapper';
import { AmazonKdpMetadataMapper } from './amazon-kdp-metadata.mapper';
import { AmazonKdpPackageBuilder } from './amazon-kdp-package.builder';
import { AmazonKdpPublishingProvider } from './amazon-kdp-publishing.provider';
import { AmazonKdpRepository } from './amazon-kdp.repository';
import { AmazonKdpManualSubmissionService } from './amazon-kdp.service';
import { AmazonKdpStatusMapper } from './amazon-kdp-status.mapper';
import { AmazonKdpValidator } from './amazon-kdp.validator';

@Module({ imports: [MongooseModule.forFeature([{ name: AmazonKdpPackage.name, schema: AmazonKdpPackageSchema }]), BookMetadataModule, ExportModule, PublishingWorkflowModule], controllers: [AmazonKdpController], providers: [AmazonKdpManualSubmissionService, AmazonKdpRepository, AmazonKdpPublishingProvider, AmazonKdpMetadataMapper, AmazonKdpPackageBuilder, AmazonKdpValidator, AmazonKdpSubmissionChecklistBuilder, AmazonKdpStatusMapper, AmazonKdpErrorMapper], exports: [AmazonKdpPublishingProvider, AmazonKdpManualSubmissionService, AmazonKdpRepository] })
export class AmazonKdpModule {}
