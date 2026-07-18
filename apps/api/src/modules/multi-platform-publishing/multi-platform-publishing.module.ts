import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { PublicationReadinessModule } from '../publication-readiness/publication-readiness.module';
import { PublishingWorkflowModule } from '../publishing-workflow/publishing-workflow.module';
import { MultiPlatformEvent, MultiPlatformEventSchema } from './entities/multi-platform-event.entity';
import { MultiPlatformPublishingOrchestration, MultiPlatformPublishingOrchestrationSchema } from './entities/multi-platform-publishing.entity';
import { MultiPlatformTarget, MultiPlatformTargetSchema } from './entities/multi-platform-target.entity';
import { MultiPlatformEventRepository } from './multi-platform-event.repository';
import { MultiPlatformPublishingController } from './multi-platform-publishing.controller';
import { MultiPlatformPublishingMapper } from './multi-platform-publishing.mapper';
import { MultiPlatformPublishingOrchestrator } from './multi-platform-publishing.orchestrator';
import { MultiPlatformPublishingRepository } from './multi-platform-publishing.repository';
import { MultiPlatformPublishingService } from './multi-platform-publishing.service';
import { MultiPlatformPublishingValidator } from './multi-platform-publishing.validator';
import { MultiPlatformTargetRepository } from './multi-platform-target.repository';
import { PublishingConflictResolver } from './publishing-conflict.resolver';
import { PublishingDependencyResolver } from './publishing-dependency.resolver';
import { PublishingExecutionStrategyFactory } from './publishing-execution-strategy.factory';
import { PublishingPlanBuilder } from './publishing-plan.builder';
import { PublishingResumeCoordinator } from './publishing-resume.coordinator';
import { PublishingRollbackCoordinator } from './publishing-rollback.coordinator';
import { PublishingStatusAggregator } from './publishing-status.aggregator';
import { PublishingTargetResolver } from './publishing-target.resolver';

@Module({ imports: [MongooseModule.forFeature([{ name: MultiPlatformPublishingOrchestration.name, schema: MultiPlatformPublishingOrchestrationSchema }, { name: MultiPlatformTarget.name, schema: MultiPlatformTargetSchema }, { name: MultiPlatformEvent.name, schema: MultiPlatformEventSchema }]), BookProjectModule, AIWritingModule, BookMetadataModule, PublicationReadinessModule, PublishingWorkflowModule], controllers: [MultiPlatformPublishingController], providers: [MultiPlatformPublishingService, MultiPlatformPublishingOrchestrator, MultiPlatformPublishingRepository, MultiPlatformTargetRepository, MultiPlatformEventRepository, MultiPlatformPublishingMapper, MultiPlatformPublishingValidator, PublishingPlanBuilder, PublishingTargetResolver, PublishingDependencyResolver, PublishingExecutionStrategyFactory, PublishingStatusAggregator, PublishingConflictResolver, PublishingRollbackCoordinator, PublishingResumeCoordinator], exports: [MultiPlatformPublishingService, MultiPlatformPublishingOrchestrator, MultiPlatformPublishingRepository, PublishingStatusAggregator] })
export class MultiPlatformPublishingModule {}
