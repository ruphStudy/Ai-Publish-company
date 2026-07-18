import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  BookMetadataDocument} from './entities/book-metadata.entity';
import {
  BookMetadata
} from './entities/book-metadata.entity';
import {
  BookMetadataRepositoryInterface,
  PaginatedBookMetadataResult,
} from './interfaces/book-metadata.repository.interface';

@Injectable()
export class BookMetadataRepository
  implements BookMetadataRepositoryInterface
{
  constructor(
    @InjectModel(BookMetadata.name)
    private readonly metadataModel: Model<BookMetadata>,
  ) {}

  create(data: Partial<BookMetadata>): Promise<BookMetadataDocument> {
    return this.metadataModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<BookMetadata>,
  ): Promise<BookMetadataDocument | null> {
    return this.metadataModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<BookMetadataDocument | null> {
    return this.metadataModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByProjectId(projectId: string): Promise<BookMetadataDocument[]> {
    return this.metadataModel
      .find({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  latestMetadata(projectId: string): Promise<BookMetadataDocument | null> {
    return this.metadataModel
      .findOne({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<BookMetadata>,
    page: number,
    limit: number,
  ): Promise<PaginatedBookMetadataResult> {
    const query = { ...filter, isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.metadataModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.metadataModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<BookMetadata>): Promise<boolean> {
    return (
      (await this.metadataModel.exists({ ...filter, isDeleted: false })) !==
      null
    );
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<BookMetadataDocument | null> {
    return this.metadataModel
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

  restore(id: string): Promise<BookMetadataDocument | null> {
    return this.metadataModel
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