import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  ChapterDocument} from './entities/chapter.entity';
import {
  Chapter
} from './entities/chapter.entity';
import {
  ChapterGeneratorRepositoryInterface,
  PaginatedChapterResult,
} from './interfaces/chapter-generator.repository.interface';

@Injectable()
export class ChapterGeneratorRepository
  implements ChapterGeneratorRepositoryInterface
{
  constructor(
    @InjectModel(Chapter.name)
    private readonly chapterModel: Model<Chapter>,
  ) {}

  create(data: Partial<Chapter>): Promise<ChapterDocument> {
    return this.chapterModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<Chapter>,
  ): Promise<ChapterDocument | null> {
    return this.chapterModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<ChapterDocument | null> {
    return this.chapterModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByProjectId(projectId: string): Promise<ChapterDocument[]> {
    return this.chapterModel
      .find({ projectId, isDeleted: false })
      .sort({ chapterNumber: 1, createdAt: -1 })
      .exec();
  }

  findByOutlineId(outlineId: string): Promise<ChapterDocument[]> {
    return this.chapterModel
      .find({ outlineId, isDeleted: false })
      .sort({ chapterNumber: 1, createdAt: -1 })
      .exec();
  }

  latestChapter(
    outlineId: string,
    chapterNumber: number,
  ): Promise<ChapterDocument | null> {
    return this.chapterModel
      .findOne({ outlineId, chapterNumber, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<Chapter>,
    page: number,
    limit: number,
  ): Promise<PaginatedChapterResult> {
    const query = { ...filter, isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.chapterModel
        .find(query)
        .sort({ chapterNumber: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.chapterModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<Chapter>): Promise<boolean> {
    return (await this.chapterModel.exists({ ...filter, isDeleted: false })) !==
      null;
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<ChapterDocument | null> {
    return this.chapterModel
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

  restore(id: string): Promise<ChapterDocument | null> {
    return this.chapterModel
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