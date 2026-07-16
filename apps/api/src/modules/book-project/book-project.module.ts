import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CategoryModule } from '../category/category.module';
import {
  BOOK_PROJECT_CONFIG_TOKEN,
  loadBookProjectConfig,
} from './config/book-project.config';
import { BookProjectController } from './book-project.controller';
import { BookProjectFactory } from './book-project.factory';
import { BookProjectMapper } from './book-project.mapper';
import { BookProjectRepository } from './book-project.repository';
import { BookProjectService } from './book-project.service';
import { BookProjectValidator } from './book-project.validator';
import {
  BookProject,
  BookProjectSchema,
} from './entities/book-project.entity';

@Module({
  imports: [
    CategoryModule,
    MongooseModule.forFeature([
      { name: BookProject.name, schema: BookProjectSchema },
    ]),
  ],
  controllers: [BookProjectController],
  providers: [
    {
      provide: BOOK_PROJECT_CONFIG_TOKEN,
      useFactory: loadBookProjectConfig,
    },
    BookProjectFactory,
    BookProjectValidator,
    BookProjectMapper,
    BookProjectRepository,
    BookProjectService,
  ],
  exports: [BookProjectService, BookProjectRepository, MongooseModule],
})
export class BookProjectModule {}