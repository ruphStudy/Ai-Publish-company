import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FilterQuery,
  Model,
  UpdateQuery,
} from 'mongoose';
import type {
  OutlineDocument} from './entities/outline.entity';
import {
  Outline
} from './entities/outline.entity';
import {
  OutlineRepositoryInterface,
  PaginatedOutlineResult,
} from './interfaces/outline.repository.interface';

@Injectable()
export class OutlineRepository implements OutlineRepositoryInterface {
  constructor(
    @InjectModel(Outline.name)
    private readonly outlineModel: Model<Outline>,
  ) {}

  create(data: Partial<Outline>): Promise<OutlineDocument> {
    return this.outlineModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<Outline>,
  ): Promise<OutlineDocument | null> {
    return this.outlineModel
      .findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true })
      .exec();
  }

  findById(id: string): Promise<OutlineDocument | null> {
    return this.outlineModel.findOne({ _id: id, isDeleted: false }).exec();
  }

  findByBlueprintId(blueprintId: string): Promise<OutlineDocument[]> {
    return this.outlineModel
      .find({ blueprintId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  latestOutline(blueprintId: string): Promise<OutlineDocument | null> {
    return this.outlineModel
      .findOne({ blueprintId, isDeleted: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async search(
    filter: FilterQuery<Outline>,
    page: number,
    limit: number,
  ): Promise<PaginatedOutlineResult> {
    const skip = (page - 1) * limit;
    const query = { ...filter, isDeleted: false };

    const [items, total] = await Promise.all([
      this.outlineModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.outlineModel.countDocuments(query).exec(),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async exists(filter: FilterQuery<Outline>): Promise<boolean> {
    const count = await this.outlineModel
      .countDocuments({ ...filter, isDeleted: false })
      .limit(1)
      .exec();

    return count > 0;
  }

  softDelete(
    id: string,
    deletedBy?: string,
  ): Promise<OutlineDocument | null> {
    return this.outlineModel
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

  restore(id: string): Promise<OutlineDocument | null> {
    return this.outlineModel
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