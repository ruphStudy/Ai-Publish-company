import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  TableOfContentsDocument} from './entities/table-of-contents.entity';
import {
  TableOfContents
} from './entities/table-of-contents.entity';
import {
  PaginatedTableOfContentsResult,
  TableOfContentsRepositoryInterface,
} from './interfaces/table-of-contents.repository.interface';

@Injectable()
export class TableOfContentsRepository
  implements TableOfContentsRepositoryInterface
{
  constructor(
    @InjectModel(TableOfContents.name)
    private readonly tocModel: Model<TableOfContents>,
  ) {}

  create(data: Partial<TableOfContents>): Promise<TableOfContentsDocument> {
    return this.tocModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<TableOfContents>,
  ): Promise<TableOfContentsDocument | null> {
    return this.tocModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<TableOfContentsDocument | null> {
    return this.tocModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByProjectId(projectId: string): Promise<TableOfContentsDocument[]> {
    return this.tocModel
      .find({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  latestTOC(projectId: string): Promise<TableOfContentsDocument | null> {
    return this.tocModel
      .findOne({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<TableOfContents>,
    page: number,
    limit: number,
  ): Promise<PaginatedTableOfContentsResult> {
    const query = { ...filter, isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.tocModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      this.tocModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<TableOfContents>): Promise<boolean> {
    return (await this.tocModel.exists({ ...filter, isDeleted: false })) !== null;
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<TableOfContentsDocument | null> {
    return this.tocModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { isDeleted: true, deletedAt: new Date(), deletedBy },
        { new: true },
      )
      .exec();
  }

  restore(id: string): Promise<TableOfContentsDocument | null> {
    return this.tocModel
      .findOneAndUpdate(
        { _id: id, isDeleted: true },
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true },
      )
      .exec();
  }
}