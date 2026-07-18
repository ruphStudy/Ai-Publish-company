import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  CoverPromptDocument} from './entities/cover-prompt.entity';
import {
  CoverPrompt
} from './entities/cover-prompt.entity';
import {
  CoverPromptRepositoryInterface,
  PaginatedCoverPromptResult,
} from './interfaces/cover-prompt.repository.interface';

@Injectable()
export class CoverPromptRepository implements CoverPromptRepositoryInterface {
  constructor(
    @InjectModel(CoverPrompt.name)
    private readonly coverPromptModel: Model<CoverPrompt>,
  ) {}

  create(data: Partial<CoverPrompt>): Promise<CoverPromptDocument> {
    return this.coverPromptModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<CoverPrompt>,
  ): Promise<CoverPromptDocument | null> {
    return this.coverPromptModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<CoverPromptDocument | null> {
    return this.coverPromptModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByProjectId(projectId: string): Promise<CoverPromptDocument[]> {
    return this.coverPromptModel
      .find({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  latestPrompt(projectId: string): Promise<CoverPromptDocument | null> {
    return this.coverPromptModel
      .findOne({ projectId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<CoverPrompt>,
    page: number,
    limit: number,
  ): Promise<PaginatedCoverPromptResult> {
    const query = { ...filter, isDeleted: false };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.coverPromptModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.coverPromptModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<CoverPrompt>): Promise<boolean> {
    return (
      (await this.coverPromptModel.exists({ ...filter, isDeleted: false })) !==
      null
    );
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<CoverPromptDocument | null> {
    return this.coverPromptModel
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

  restore(id: string): Promise<CoverPromptDocument | null> {
    return this.coverPromptModel
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