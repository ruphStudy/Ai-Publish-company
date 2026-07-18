import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import { Book } from './entities/book.entity';
import { CreateBookDto, UpdateBookDto, BookQueryDto } from './dto';

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const PROJECTION = '-isDeleted -deletedAt -deletedBy -__v' as const;

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class BookRepository {
  constructor(
    @InjectModel(Book.name)
    private readonly bookModel: Model<Book>,
  ) {}

  async create(
    data: CreateBookDto & { slug: string },
    userId: Types.ObjectId,
  ): Promise<Book> {
    const book = new this.bookModel({ ...data, createdBy: userId });
    return book.save();
  }

  async findAll(query: BookQueryDto): Promise<PaginatedResult<Book>> {
    const {
      search,
      status,
      language,
      categoryId,
      currentStage,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = query;

    const filter: FilterQuery<Book> = {};

    if (search) filter.$text = { $search: search };
    if (status !== undefined) filter.status = status;
    if (language !== undefined) filter.language = language;
    if (currentStage !== undefined) filter.currentStage = currentStage;
    if (categoryId && Types.ObjectId.isValid(categoryId)) {
      filter.categoryId = new Types.ObjectId(categoryId);
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean()
        .exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as Book[],
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string): Promise<Book | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.bookModel
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Book | null;
  }

  async findBySlug(slug: string): Promise<Book | null> {
    return this.bookModel
      .findOne({ slug })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Book | null;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<Book> = { slug };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.bookModel.countDocuments(filter).exec()) > 0;
  }

  async existsByTitleAndLanguage(
    title: string,
    language: string,
    excludeId?: string,
  ): Promise<boolean> {
    const filter: FilterQuery<Book> = {
      title: new RegExp(`^${escapeRegex(title)}$`, 'i'),
      language,
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.bookModel.countDocuments(filter).exec()) > 0;
  }

  async update(
    id: string,
    data: UpdateBookDto & { slug?: string },
    userId: Types.ObjectId,
  ): Promise<Book | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.bookModel
      .findByIdAndUpdate(id, { ...data, updatedBy: userId }, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Book | null;
  }

  async softDelete(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;
    const result = await this.bookModel
      .updateOne(
        { _id: id },
        { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
      )
      .exec();
    return result.modifiedCount > 0;
  }

  async restore(id: string): Promise<Book | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.bookModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true },
      )
      .setOptions({ includeDeleted: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Book | null;
  }
}
