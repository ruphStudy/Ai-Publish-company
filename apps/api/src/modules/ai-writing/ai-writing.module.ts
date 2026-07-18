import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { ChapterGeneratorModule } from '../chapter-generator/chapter-generator.module';
import { OutlineModule } from '../outline/outline.module';
import { AIWritingController } from './ai-writing.controller';
import { AIWritingFactory } from './ai-writing.factory';
import { AIWritingEngine } from './ai-writing.engine';
import { AIWritingMapper } from './ai-writing.mapper';
import { AIWritingPipeline } from './ai-writing.pipeline';
import { AIWritingRepository } from './ai-writing.repository';
import { AIWritingService } from './ai-writing.service';
import { AIWritingValidator } from './ai-writing.validator';
import { CostCalculator } from './cost.calculator';
import {
  BookContent,
  BookContentSchema,
} from './entities/book-content.entity';
import { AIWritingResponseParser } from './parsers/ai-writing-response.parser';
import { AIWritingPromptBuilder } from './prompt/ai-writing-prompt.builder';
import { AIWritingPromptTemplateManager } from './prompt/ai-writing-prompt-template.manager';
import { AIWritingProviderFactory } from './providers/ai-writing-provider.factory';
import { OpenAIWritingProvider } from './providers/openai-writing.provider';
import { AIWritingRetryStrategy } from './retry/ai-writing-retry.strategy';
import { TokenUsageTracker } from './token-usage.tracker';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BookContent.name,
        schema: BookContentSchema,
      },
    ]),
    BookBlueprintModule,
    OutlineModule,
    ChapterGeneratorModule,
  ],
  controllers: [AIWritingController],
  providers: [
    AIWritingService,
    AIWritingRepository,
    AIWritingFactory,
    AIWritingValidator,
    AIWritingMapper,
    AIWritingEngine,
    AIWritingPipeline,
    AIWritingPromptBuilder,
    AIWritingPromptTemplateManager,
    AIWritingResponseParser,
    AIWritingRetryStrategy,
    TokenUsageTracker,
    CostCalculator,
    OpenAIWritingProvider,
    AIWritingProviderFactory,
  ],
  exports: [AIWritingService, AIWritingRepository],
})
export class AIWritingModule {}