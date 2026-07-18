import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BookProjectModule } from '../book-project/book-project.module';
import { MarketIntelligenceModule } from '../market-intelligence/market-intelligence.module';
import {
  BOOK_BLUEPRINT_CONFIG_TOKEN,
  loadBookBlueprintConfig,
} from './config/book-blueprint.config';
import { BookBlueprintController } from './book-blueprint.controller';
import { BookBlueprintEngine } from './book-blueprint.engine';
import { BookBlueprintFactory } from './book-blueprint.factory';
import { BookBlueprintMapper } from './book-blueprint.mapper';
import { BookBlueprintPipeline } from './book-blueprint.pipeline';
import { BookBlueprintRepository } from './book-blueprint.repository';
import { BookBlueprintService } from './book-blueprint.service';
import { BookBlueprintValidator } from './book-blueprint.validator';
import {
  BookBlueprint,
  BookBlueprintSchema,
} from './entities/book-blueprint.entity';

@Module({
  imports: [
    BookProjectModule,
    MarketIntelligenceModule,
    MongooseModule.forFeature([
      { name: BookBlueprint.name, schema: BookBlueprintSchema },
    ]),
  ],
  controllers: [BookBlueprintController],
  providers: [
    {
      provide: BOOK_BLUEPRINT_CONFIG_TOKEN,
      useFactory: loadBookBlueprintConfig,
    },
    BookBlueprintFactory,
    BookBlueprintValidator,
    BookBlueprintMapper,
    BookBlueprintEngine,
    BookBlueprintPipeline,
    BookBlueprintRepository,
    BookBlueprintService,
  ],
  exports: [BookBlueprintService, BookBlueprintRepository, MongooseModule],
})
export class BookBlueprintModule {}