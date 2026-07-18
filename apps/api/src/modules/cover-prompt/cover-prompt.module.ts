import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { OutlineModule } from '../outline/outline.module';
import { CoverPromptController } from './cover-prompt.controller';
import { CoverPromptEngine } from './cover-prompt.engine';
import { CoverPromptFactory } from './cover-prompt.factory';
import { CoverPromptMapper } from './cover-prompt.mapper';
import { CoverPromptRepository } from './cover-prompt.repository';
import { CoverPromptService } from './cover-prompt.service';
import { CoverPromptValidator } from './cover-prompt.validator';
import {
  CoverPrompt,
  CoverPromptSchema,
} from './entities/cover-prompt.entity';
import { GenreStyleMapper } from './genre-style.mapper';
import { CoverPromptBuilder } from './prompt/cover-prompt.builder';
import { CoverPromptTemplateManager } from './prompt/cover-prompt-template.manager';
import { StyleRecommendationEngine } from './style-recommendation.engine';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CoverPrompt.name,
        schema: CoverPromptSchema,
      },
    ]),
    BookProjectModule,
    BookBlueprintModule,
    OutlineModule,
    AIWritingModule,
    BookMetadataModule,
  ],
  controllers: [CoverPromptController],
  providers: [
    CoverPromptService,
    CoverPromptRepository,
    CoverPromptEngine,
    CoverPromptFactory,
    CoverPromptValidator,
    CoverPromptMapper,
    GenreStyleMapper,
    StyleRecommendationEngine,
    CoverPromptBuilder,
    CoverPromptTemplateManager,
  ],
  exports: [CoverPromptService, CoverPromptRepository],
})
export class CoverPromptModule {}