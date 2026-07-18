import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIWritingModule } from '../ai-writing/ai-writing.module';
import { BookBlueprintModule } from '../book-blueprint/book-blueprint.module';
import { BookMetadataModule } from '../book-metadata/book-metadata.module';
import { BookProjectModule } from '../book-project/book-project.module';
import { OutlineModule } from '../outline/outline.module';
import {
  TableOfContents,
  TableOfContentsSchema,
} from './entities/table-of-contents.entity';
import { NavigationBuilder } from './navigation.builder';
import { PaginationEngine } from './pagination.engine';
import { TableOfContentsController } from './table-of-contents.controller';
import { TableOfContentsEngine } from './table-of-contents.engine';
import { TOCFactory } from './table-of-contents.factory';
import { TOCMapper } from './table-of-contents.mapper';
import { TableOfContentsRepository } from './table-of-contents.repository';
import { TableOfContentsService } from './table-of-contents.service';
import { TOCValidator } from './table-of-contents.validator';
import { TOCBuilder } from './toc.builder';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TableOfContents.name,
        schema: TableOfContentsSchema,
      },
    ]),
    BookProjectModule,
    BookBlueprintModule,
    OutlineModule,
    AIWritingModule,
    BookMetadataModule,
  ],
  controllers: [TableOfContentsController],
  providers: [
    TableOfContentsService,
    TableOfContentsRepository,
    TableOfContentsEngine,
    TOCFactory,
    TOCValidator,
    TOCMapper,
    TOCBuilder,
    PaginationEngine,
    NavigationBuilder,
  ],
  exports: [TableOfContentsService, TableOfContentsRepository],
})
export class TableOfContentsModule {}