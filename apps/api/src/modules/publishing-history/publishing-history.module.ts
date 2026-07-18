import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from '../audit/audit.module';
import { PublishingAudit, PublishingAuditSchema } from './entities/publishing-audit.entity';
import { PublishingHistory, PublishingHistorySchema } from './entities/publishing-history.entity';
import { PublishingAuditEngine } from './publishing-audit.engine';
import { PublishingAuditEventMapper } from './publishing-audit-event.mapper';
import { PublishingAuditRepository } from './publishing-audit.repository';
import { PublishingHistoryAggregator } from './publishing-history-aggregator';
import { PublishingHistoryController } from './publishing-history.controller';
import { PublishingHistoryEngine } from './publishing-history.engine';
import { PublishingHistoryQueryService } from './publishing-history-query.service';
import { PublishingHistoryRepository } from './publishing-history.repository';
import { PublishingHistoryService } from './publishing-history.service';
import { PublishingTimelineBuilder } from './publishing-timeline.builder';

@Module({ imports: [AuditModule, MongooseModule.forFeature([{ name: PublishingHistory.name, schema: PublishingHistorySchema }, { name: PublishingAudit.name, schema: PublishingAuditSchema }])], controllers: [PublishingHistoryController], providers: [PublishingHistoryService, PublishingHistoryEngine, PublishingAuditEngine, PublishingHistoryRepository, PublishingAuditRepository, PublishingHistoryAggregator, PublishingTimelineBuilder, PublishingAuditEventMapper, PublishingHistoryQueryService], exports: [PublishingHistoryService, PublishingHistoryEngine, PublishingAuditEngine, PublishingHistoryRepository, PublishingAuditRepository] })
export class PublishingHistoryModule {}
