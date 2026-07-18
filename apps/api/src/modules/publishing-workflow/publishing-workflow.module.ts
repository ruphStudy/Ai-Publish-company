import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { ExportModule } from '../export/export.module';
import { PublicationReadinessModule } from '../publication-readiness/publication-readiness.module';
import { TableOfContentsModule } from '../table-of-contents/table-of-contents.module';
import { PlatformModule } from '../../core/platform';
import { AmazonKdpErrorMapper } from '../amazon-kdp/amazon-kdp-error.mapper';
import { AmazonKdpPublishingProvider } from '../amazon-kdp/amazon-kdp-publishing.provider';
import { Draft2DigitalErrorMapper } from '../draft2digital/draft2digital-error.mapper';
import { Draft2DigitalPublishingProvider } from '../draft2digital/draft2digital-publishing.provider';
import { GooglePlayBooksErrorMapper } from '../google-play-books/google-play-books-error.mapper';
import { GooglePlayBooksPublishingProvider } from '../google-play-books/google-play-books-publishing.provider';
import { PublishingTargetExecution, PublishingTargetExecutionSchema } from './entities/publishing-target-execution.entity';
import { PublishingWorkflowEvent, PublishingWorkflowEventSchema } from './entities/publishing-workflow-event.entity';
import { PublishingWorkflowStep, PublishingWorkflowStepSchema } from './entities/publishing-workflow-step.entity';
import { PublishingWorkflow, PublishingWorkflowSchema } from './entities/publishing-workflow.entity';
import { MockPublishingProvider } from './providers/mock-publishing.provider';
import { PublishingProviderFactory } from './publishing-provider.factory';
import { PublishingTargetExecutionRepository } from './publishing-target-execution.repository';
import { PublishingWorkflowController } from './publishing-workflow.controller';
import { PublishingWorkflowEngine } from './publishing-workflow.engine';
import { PublishingWorkflowEventRepository } from './publishing-workflow-event.repository';
import { PublishingWorkflowFactory } from './publishing-workflow.factory';
import { PublishingWorkflowMapper } from './publishing-workflow.mapper';
import { PublishingWorkflowOrchestrator } from './publishing-workflow.orchestrator';
import { PublishingWorkflowRepository } from './publishing-workflow.repository';
import { PublishingWorkflowService } from './publishing-workflow.service';
import { PublishingWorkflowStepRepository } from './publishing-workflow-step.repository';
import { PublishingWorkflowValidator } from './publishing-workflow.validator';

@Module({ imports: [PlatformModule, MongooseModule.forFeature([{ name: PublishingWorkflow.name, schema: PublishingWorkflowSchema }, { name: PublishingTargetExecution.name, schema: PublishingTargetExecutionSchema }, { name: PublishingWorkflowStep.name, schema: PublishingWorkflowStepSchema }, { name: PublishingWorkflowEvent.name, schema: PublishingWorkflowEventSchema }]), BookProjectModule, AIWritingModule, PublicationReadinessModule, BookMetadataModule, TableOfContentsModule, ExportModule], controllers: [PublishingWorkflowController], providers: [PublishingWorkflowService, PublishingWorkflowRepository, PublishingTargetExecutionRepository, PublishingWorkflowStepRepository, PublishingWorkflowEventRepository, PublishingWorkflowEngine, PublishingWorkflowFactory, PublishingWorkflowValidator, PublishingWorkflowMapper, PublishingWorkflowOrchestrator, PublishingProviderFactory, MockPublishingProvider, AmazonKdpPublishingProvider, AmazonKdpErrorMapper, Draft2DigitalPublishingProvider, Draft2DigitalErrorMapper, GooglePlayBooksPublishingProvider, GooglePlayBooksErrorMapper], exports: [PublishingWorkflowService, PublishingWorkflowRepository, PublishingTargetExecutionRepository, PublishingWorkflowOrchestrator, PublishingProviderFactory] })
export class PublishingWorkflowModule {}
