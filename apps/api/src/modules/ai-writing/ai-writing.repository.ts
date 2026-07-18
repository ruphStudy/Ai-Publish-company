import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  BookContentDocument} from './entities/book-content.entity';
import {
  BookContent
} from './entities/book-content.entity';
import {
  AIWritingRepositoryInterface,
  PaginatedContentResult,
} from './interfaces/ai-writing.repository.interface';

@Injectable()
export class AIWritingRepository implements AIWritingRepositoryInterface {
  constructor(
    @InjectModel(BookContent.name)
    private readonly contentModel: Model<BookContent>,
  ) {}

  create(data: Partial<BookContent>): Promise<BookContentDocument> {
    return this.contentModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<BookContent>,
  ): Promise<BookContentDocument | null> {
    return this.contentModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<BookContentDocument | null> {
    return this.contentModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByProjectId(projectId: string): Promise<BookContentDocument[]> {
    return this.contentModel
      .find({ projectId, isDeleted: false })
      .sort({ chapterNumber: 1, createdAt: -1 })
      .exec();
  }

  findByChapterId(chapterId: string): Promise<BookContentDocument[]> {
    return this.contentModel
      .find({ chapterId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  latestVersion(chapterId: string): Promise<BookContentDocument | null> {
    return this.contentModel
      .findOne({ chapterId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<BookContent>,
    page: number,
    limit: number,
  ): Promise<PaginatedContentResult> {
    const query = { ...filter, isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.contentModel
        .find(query)
        .sort({ chapterNumber: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.contentModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<BookContent>): Promise<boolean> {
    return (await this.contentModel.exists({ ...filter, isDeleted: false })) !==
      null;
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<BookContentDocument | null> {
    return this.contentModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy,
        },
        { new: true },
      )
      .exec();
  }

  restore(id: string): Promise<BookContentDocument | null> {
    return this.contentModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
        { new: true },
      )
      .exec();
  }
}