import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { KnowledgeDatabaseModule } from '../knowledge-database/knowledge-database.module';
import {
  AI_CLASSIFICATION_CONFIG_TOKEN,
  loadAIClassificationConfig,
} from './config/ai-classification.config';
import { AIClassificationEngine } from './ai-classification.engine';
import { AIClassificationMapper } from './ai-classification.mapper';
import { AIClassificationRepository } from './ai-classification.repository';
import { AIClassificationService } from './ai-classification.service';
import { AIClassificationValidator } from './ai-classification.validator';
import { ClassificationFactory } from './classification.factory';
import { ClassificationPipeline } from './classification.pipeline';
import {
  AIClassification,
  AIClassificationSchema,
} from './entities/ai-classification.entity';
import { CLASSIFICATION_STRATEGIES_TOKEN } from './interfaces/classification-strategy.interface';
import { RuleBasedClassificationStrategy } from './strategies/rule-based-classification.strategy';

@Module({
  imports: [
    KnowledgeDatabaseModule,
    MongooseModule.forFeature([
      { name: AIClassification.name, schema: AIClassificationSchema },
    ]),
  ],
  providers: [
    {
      provide: AI_CLASSIFICATION_CONFIG_TOKEN,
      useFactory: loadAIClassificationConfig,
    },
    RuleBasedClassificationStrategy,
    {
      provide: CLASSIFICATION_STRATEGIES_TOKEN,
      useFactory: (ruleBasedStrategy: RuleBasedClassificationStrategy) => [
        ruleBasedStrategy,
      ],
      inject: [RuleBasedClassificationStrategy],
    },
    AIClassificationValidator,
    AIClassificationMapper,
    ClassificationFactory,
    ClassificationPipeline,
    AIClassificationEngine,
    AIClassificationRepository,
    AIClassificationService,
  ],
  exports: [
    AIClassificationService,
    AIClassificationRepository,
    AIClassificationEngine,
  ],
})
export class AIClassificationModule {}