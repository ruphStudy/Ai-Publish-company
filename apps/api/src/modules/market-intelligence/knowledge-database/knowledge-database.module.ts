import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  KNOWLEDGE_DATABASE_CONFIG_TOKEN,
  loadKnowledgeDatabaseConfig,
} from './config/knowledge-database.config';
import {
  MarketKnowledge,
  MarketKnowledgeSchema,
} from './entities/market-knowledge.entity';
import { KnowledgeDatabaseDuplicateDetectionService } from './knowledge-database-duplicate-detection.service';
import { KnowledgeDatabaseFactory } from './knowledge-database.factory';
import { KnowledgeDatabaseMapper } from './knowledge-database.mapper';
import { KnowledgeDatabaseRepository } from './knowledge-database.repository';
import { KnowledgeDatabaseService } from './knowledge-database.service';
import { KnowledgeDatabaseValidator } from './knowledge-database.validator';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MarketKnowledge.name, schema: MarketKnowledgeSchema },
    ]),
  ],
  providers: [
    {
      provide: KNOWLEDGE_DATABASE_CONFIG_TOKEN,
      useFactory: loadKnowledgeDatabaseConfig,
    },
    KnowledgeDatabaseFactory,
    KnowledgeDatabaseMapper,
    KnowledgeDatabaseValidator,
    KnowledgeDatabaseDuplicateDetectionService,
    KnowledgeDatabaseRepository,
    KnowledgeDatabaseService,
  ],
  exports: [
    KnowledgeDatabaseRepository,
    KnowledgeDatabaseService,
    KnowledgeDatabaseValidator,
    KnowledgeDatabaseMapper,
  ],
})
export class KnowledgeDatabaseModule {}