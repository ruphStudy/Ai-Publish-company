import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { OutlineController } from './outline.controller';
import { OutlineFactory } from './outline.factory';
import { OutlineGenerationEngine } from './outline-generation.engine';
import { OutlineGenerationPipeline } from './outline-generation.pipeline';
import { OutlineMapper } from './outline.mapper';
import { OutlineRepository } from './outline.repository';
import { OutlineService } from './outline.service';
import { OutlineValidator } from './outline.validator';
import { Outline, OutlineSchema } from './entities/outline.entity';
import { AI_OUTLINE_PROVIDER } from './interfaces/ai-outline-provider.interface';
import { OutlineResponseParser } from './parsers/outline-response.parser';
import { OutlinePromptBuilder } from './prompt/outline-prompt.builder';
import { OutlinePromptTemplateManager } from './prompt/outline-prompt-template.manager';
import { OpenAiOutlineProvider } from './providers/openai-outline.provider';
import { OutlineRetryStrategy } from './retry/outline-retry.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Outline.name,
        schema: OutlineSchema,
      },
    ]),
    BookBlueprintModule,
  ],
  controllers: [OutlineController],
  providers: [
    OutlineService,
    OutlineRepository,
    OutlineFactory,
    OutlineValidator,
    OutlineMapper,
    OutlineGenerationEngine,
    OutlineGenerationPipeline,
    OutlinePromptBuilder,
    OutlinePromptTemplateManager,
    OutlineResponseParser,
    OutlineRetryStrategy,
    OpenAiOutlineProvider,
    {
      provide: AI_OUTLINE_PROVIDER,
      useExisting: OpenAiOutlineProvider,
    },
  ],
  exports: [OutlineService, OutlineRepository],
})
export class OutlineModule {}
