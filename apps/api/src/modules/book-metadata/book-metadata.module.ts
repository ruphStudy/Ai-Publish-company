import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { OutlineModule } from '../outline/outline.module';
import { MetadataFactory } from './book-metadata.factory';
import { BookMetadataController } from './book-metadata.controller';
import { BookMetadataEngine } from './book-metadata.engine';
import { MetadataMapper } from './book-metadata.mapper';
import { BookMetadataPipeline } from './book-metadata.pipeline';
import { BookMetadataRepository } from './book-metadata.repository';
import { BookMetadataService } from './book-metadata.service';
import { MetadataValidator } from './book-metadata.validator';
import {
  BookMetadata,
  BookMetadataSchema,
} from './entities/book-metadata.entity';
import { BookMetadataResponseParser } from './parsers/book-metadata-response.parser';
import { BookMetadataPromptBuilder } from './prompt/book-metadata-prompt.builder';
import { BookMetadataPromptTemplateManager } from './prompt/book-metadata-prompt-template.manager';
import { OpenAiMetadataProvider } from './providers/openai-metadata.provider';
import { BookMetadataRetryStrategy } from './retry/book-metadata-retry.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BookMetadata.name,
        schema: BookMetadataSchema,
      },
    ]),
    BookProjectModule,
    BookBlueprintModule,
    OutlineModule,
    AIWritingModule,
  ],
  controllers: [BookMetadataController],
  providers: [
    BookMetadataService,
    BookMetadataRepository,
    MetadataFactory,
    MetadataValidator,
    MetadataMapper,
    BookMetadataEngine,
    BookMetadataPipeline,
    BookMetadataPromptBuilder,
    BookMetadataPromptTemplateManager,
    BookMetadataResponseParser,
    BookMetadataRetryStrategy,
    OpenAiMetadataProvider,
  ],
  exports: [BookMetadataService, BookMetadataRepository],
})
export class BookMetadataModule {}