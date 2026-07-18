import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import type {
  BookBlueprintQueryDto,
  UpdateBookBlueprintDto,
} from './dto';
import { BookBlueprint } from './entities/book-blueprint.entity';
import {
  BookBlueprintRepositoryInterface,
  CreateBookBlueprintData,
  PaginatedBookBlueprintResult,
} from './interfaces/book-blueprint.repository.interface';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -updatedBy -__v' as const;

@Injectable()
export class BookBlueprintRepository implements BookBlueprintRepositoryInterface {
  constructor(
    @InjectModel(BookBlueprint.name)
    private readonly model: Model<BookBlueprint>,
  ) {}

  async create(
    data: CreateBookBlueprintData,
    userId: Types.ObjectId,
  ): Promise<BookBlueprint> {
    const blueprint = new this.model({
      ...data,
      createdBy: userId,
      updatedBy: userId,
    });

    return blueprint.save();
  }

  async update(
    id: string,
    data: UpdateBookBlueprintDto,
    userId: Types.ObjectId,
  ): Promise<BookBlueprint | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findByIdAndUpdate(
        id,
        {
          ...data,
          updatedBy: userId,
        },
        { new: true },
      )
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookBlueprint | null;
  }

  async delete(id: string, userId: Types.ObjectId): Promise<boolean> {
    return this.softDelete(id, userId);
  }

  async softDelete(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.model
      .updateOne(
        { _id: new Types.ObjectId(id) },
        {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: userId,
        },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async restore(id: string): Promise<BookBlueprint | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
        },
        { new: true },
      )
      .setOptions({ includeDeleted: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookBlueprint | null;
  }

  async findById(id: string): Promise<BookBlueprint | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookBlueprint | null;
  }

  async findByProjectId(projectId: string): Promise<BookBlueprint[]> {
    if (!Types.ObjectId.isValid(projectId)) {
      return [];
    }

    return this.model
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookBlueprint[];
  }

  async latestBlueprint(projectId: string): Promise<BookBlueprint | null> {
    if (!Types.ObjectId.isValid(projectId)) {
      return null;
    }

    return this.model
      .findOne({ projectId: new Types.ObjectId(projectId) })
      .sort({ createdAt: -1 })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookBlueprint | null;
  }

  async search(
    query: BookBlueprintQueryDto,
  ): Promise<PaginatedBookBlueprintResult> {
    return this.findAll(query);
  }

  async paginate(
    query: BookBlueprintQueryDto,
  ): Promise<PaginatedBookBlueprintResult> {
    return this.findAll(query);
  }

  async existsByBlueprintId(blueprintId: string): Promise<boolean> {
    return (
      (await this.model
        .countDocuments({ blueprintId: blueprintId.toUpperCase() })
        .exec()) > 0
    );
  }

  private async findAll(
    query: BookBlueprintQueryDto,
  ): Promise<PaginatedBookBlueprintResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ?? 'updatedAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const filter = this.buildFilter(query);
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean()
        .exec(),
      this.model.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as BookBlueprint[],
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

  private buildFilter(
    query: Partial<BookBlueprintQueryDto>,
  ): FilterQuery<BookBlueprint> {
    const filter: FilterQuery<BookBlueprint> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.projectId && Types.ObjectId.isValid(query.projectId)) {
      filter.projectId = new Types.ObjectId(query.projectId);
    }

    if (query.genre) {
      filter.genre = new RegExp(query.genre, 'i');
    }

    if (query.niche) {
      filter.niche = new RegExp(query.niche, 'i');
    }

    if (query.status) {
      filter.status = query.status;
    }

    return filter;
  }
}