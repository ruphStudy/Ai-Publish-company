import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Book, BookSchema } from './entities/book.entity';
import { BookController } from './book.controller';
import { BookService } from './book.service';
import { BookRepository } from './book.repository';

@Module({
  imports: [MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }])],
  controllers: [BookController],
  providers: [BookService, BookRepository],
  exports: [BookService, BookRepository, MongooseModule],
})
export class BookModule {}
