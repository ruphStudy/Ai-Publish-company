import { Injectable } from '@nestjs/common';

import { MarketKnowledgeResponseDto } from '../knowledge-database/dto';
import {
  AI_CLASSIFICATION_CONFIG_TOKEN,
  AIClassificationConfig,
} from './config/ai-classification.config';
import { ClassificationPipeline } from './classification.pipeline';
import { ClassificationResult } from './models/classification-result.model';
import { Inject } from '@nestjs/common';

@Injectable()
export class AIClassificationEngine {
  constructor(
    private readonly pipeline: ClassificationPipeline,
    @Inject(AI_CLASSIFICATION_CONFIG_TOKEN)
    private readonly config: AIClassificationConfig,
  ) {}

  async classify(
    knowledge: MarketKnowledgeResponseDto,
  ): Promise<ClassificationResult> {
    return this.pipeline.execute({
      knowledge,
      classificationVersion: this.config.classificationVersion,
    });
  }
}