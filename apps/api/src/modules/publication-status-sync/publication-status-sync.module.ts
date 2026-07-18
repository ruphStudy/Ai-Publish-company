import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MongooseModule } from '@nestjs/mongoose';
import { MultiPlatformPublishingModule } from '../multi-platform-publishing/multi-platform-publishing.module';
import { MultiPlatformPublishingOrchestration, MultiPlatformPublishingOrchestrationSchema } from '../multi-platform-publishing/entities/multi-platform-publishing.entity';
import { MultiPlatformTarget, MultiPlatformTargetSchema } from '../multi-platform-publishing/entities/multi-platform-target.entity';
import { PublishingTargetExecution, PublishingTargetExecutionSchema } from '../publishing-workflow/entities/publishing-target-execution.entity';
import { PublishingWorkflow, PublishingWorkflowSchema } from '../publishing-workflow/entities/publishing-workflow.entity';
import { PublishingWorkflowModule } from '../publishing-workflow/publishing-workflow.module';
import { PublishingTargetExecutionRepository } from '../publishing-workflow/publishing-target-execution.repository';
import { PublishingWorkflowRepository } from '../publishing-workflow/publishing-workflow.repository';
import { MultiPlatformPublishingRepository } from '../multi-platform-publishing/multi-platform-publishing.repository';
import { MultiPlatformTargetRepository } from '../multi-platform-publishing/multi-platform-target.repository';
import { PublicationStatusHistory, PublicationStatusHistorySchema } from './entities/publication-status-history.entity';
import { PublicationStatusSync, PublicationStatusSyncSchema } from './entities/publication-status-sync.entity';
import { PublicationStatusAggregator } from './publication-status-aggregator';
import { PublicationStatusConflictResolver } from './publication-status-conflict.resolver';
import { PublicationStatusSyncController } from './publication-status-sync.controller';
import { PublicationStatusSyncEngine } from './publication-status-sync.engine';
import { PublicationStatusEventPublisher } from './publication-status-event.publisher';
import { PublicationStatusHistoryRepository } from './publication-status-history.repository';
import { PublicationStatusNormalizer } from './publication-status-normalizer';
import { PublicationStatusScheduler, PUBLICATION_STATUS_SYNC_QUEUE } from './publication-status-scheduler';
import { PublicationStatusSyncOrchestrator } from './publication-status-sync.orchestrator';
import { PublicationStatusSyncRepository } from './publication-status-sync.repository';
import { PublicationStatusSyncService } from './publication-status-sync.service';
import { PublicationStatusSyncStrategyFactory } from './publication-status-sync-strategy.factory';
import { PublicationStatusTransitionValidator } from './publication-status-transition.validator';
import { PublicationStatusWorker } from './publication-status.worker';

@Module({ imports: [PublishingWorkflowModule, MultiPlatformPublishingModule, BullModule.registerQueue({ name: PUBLICATION_STATUS_SYNC_QUEUE }), MongooseModule.forFeature([{ name: PublicationStatusSync.name, schema: PublicationStatusSyncSchema }, { name: PublicationStatusHistory.name, schema: PublicationStatusHistorySchema }, { name: PublishingTargetExecution.name, schema: PublishingTargetExecutionSchema }, { name: PublishingWorkflow.name, schema: PublishingWorkflowSchema }, { name: MultiPlatformTarget.name, schema: MultiPlatformTargetSchema }, { name: MultiPlatformPublishingOrchestration.name, schema: MultiPlatformPublishingOrchestrationSchema }])], controllers: [PublicationStatusSyncController], providers: [PublicationStatusSyncService, PublicationStatusSyncEngine, PublicationStatusSyncOrchestrator, PublicationStatusSyncRepository, PublicationStatusHistoryRepository, PublishingTargetExecutionRepository, PublishingWorkflowRepository, MultiPlatformTargetRepository, MultiPlatformPublishingRepository, PublicationStatusAggregator, PublicationStatusNormalizer, PublicationStatusTransitionValidator, PublicationStatusConflictResolver, PublicationStatusSyncStrategyFactory, PublicationStatusScheduler, PublicationStatusWorker, PublicationStatusEventPublisher], exports: [PublicationStatusSyncService, PublicationStatusSyncOrchestrator, PublicationStatusSyncRepository, PublicationStatusHistoryRepository] })
export class PublicationStatusSyncModule {}
