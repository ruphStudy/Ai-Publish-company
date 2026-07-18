import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { OutlineModule } from '../outline/outline.module';
import { ChapterFactory } from './chapter.factory';
import { ChapterGenerationEngine } from './chapter-generation.engine';
import { ChapterGenerationPipeline } from './chapter-generation.pipeline';
import { ChapterGeneratorController } from './chapter-generator.controller';
import { ChapterGeneratorRepository } from './chapter-generator.repository';
import { ChapterGeneratorService } from './chapter-generator.service';
import { ChapterMapper } from './chapter.mapper';
import { ChapterValidator } from './chapter.validator';
import { Chapter, ChapterSchema } from './entities/chapter.entity';
import { ChapterResponseParser } from './parsers/chapter-response.parser';
import { ChapterPromptBuilder } from './prompt/chapter-prompt.builder';
import { ChapterPromptTemplateManager } from './prompt/chapter-prompt-template.manager';
import { OpenAiChapterProvider } from './providers/openai-chapter.provider';
import { ChapterRetryStrategy } from './retry/chapter-retry.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Chapter.name,
        schema: ChapterSchema,
      },
    ]),
    BookBlueprintModule,
    OutlineModule,
  ],
  controllers: [ChapterGeneratorController],
  providers: [
    ChapterGeneratorService,
    ChapterGeneratorRepository,
    ChapterFactory,
    ChapterValidator,
    ChapterMapper,
    ChapterGenerationEngine,
    ChapterGenerationPipeline,
    ChapterPromptBuilder,
    ChapterPromptTemplateManager,
    ChapterResponseParser,
    ChapterRetryStrategy,
    OpenAiChapterProvider,
  ],
  exports: [ChapterGeneratorService, ChapterGeneratorRepository],
})
export class ChapterGeneratorModule {}