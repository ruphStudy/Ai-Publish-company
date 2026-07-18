import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import type {
  BookProjectQueryDto,
  CreateBookProjectDto,
  UpdateBookProjectDto,
} from './dto';
import { BookProject } from './entities/book-project.entity';
import {
  BookProjectRepositoryInterface,
  PaginatedBookProjectResult,
} from './interfaces/book-project.repository.interface';

const PROJECTION = '-isDeleted -deletedAt -deletedBy -createdBy -updatedBy -__v' as const;

@Injectable()
export class BookProjectRepository implements BookProjectRepositoryInterface {
  constructor(
    @InjectModel(BookProject.name)
    private readonly model: Model<BookProject>,
  ) {}

  async create(
    data: Omit<CreateBookProjectDto, 'ownerId'> & {
      projectCode: string;
      ownerId: Types.ObjectId;
    },
    userId: Types.ObjectId,
  ): Promise<BookProject> {
    const project = new this.model({
      ...data,
      categoryId: new Types.ObjectId(data.categoryId),
      subCategoryId: data.subCategoryId
        ? new Types.ObjectId(data.subCategoryId)
        : null,
      createdBy: userId,
      updatedBy: userId,
    });

    return project.save();
  }

  async update(
    id: string,
    data: UpdateBookProjectDto,
    userId: Types.ObjectId,
  ): Promise<BookProject | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const update = {
      ...data,
      ...(data.categoryId
        ? { categoryId: new Types.ObjectId(data.categoryId) }
        : {}),
      ...(data.subCategoryId
        ? { subCategoryId: new Types.ObjectId(data.subCategoryId) }
        : {}),
      ...(data.ownerId ? { ownerId: new Types.ObjectId(data.ownerId) } : {}),
      updatedBy: userId,
      $inc: { version: 1 },
    };

    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookProject | null;
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

  async restore(id: string): Promise<BookProject | null> {
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
      .exec() as unknown as BookProject | null;
  }

  async findById(id: string): Promise<BookProject | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    return this.model
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookProject | null;
  }

  async findByProjectCode(projectCode: string): Promise<BookProject | null> {
    return this.model
      .findOne({ projectCode: projectCode.toUpperCase() })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as BookProject | null;
  }

  async search(
    query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResult> {
    return this.findAll(query);
  }

  async filter(
    query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResult> {
    return this.findAll(query);
  }

  async paginate(
    query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResult> {
    return this.findAll(query);
  }

  async existsByProjectCode(projectCode: string): Promise<boolean> {
    return (
      (await this.model
        .countDocuments({ projectCode: projectCode.toUpperCase() })
        .exec()) > 0
    );
  }

  async count(query?: BookProjectQueryDto): Promise<number> {
    return this.model.countDocuments(this.buildFilter(query ?? {})).exec();
  }

  private async findAll(
    query: BookProjectQueryDto,
  ): Promise<PaginatedBookProjectResult> {
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
      data: data as unknown as BookProject[],
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
    query: Partial<BookProjectQueryDto>,
  ): FilterQuery<BookProject> {
    const filter: FilterQuery<BookProject> = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    if (query.categoryId && Types.ObjectId.isValid(query.categoryId)) {
      filter.categoryId = new Types.ObjectId(query.categoryId);
    }

    if (query.subCategoryId && Types.ObjectId.isValid(query.subCategoryId)) {
      filter.subCategoryId = new Types.ObjectId(query.subCategoryId);
    }

    if (query.niche) {
      filter.niche = new RegExp(query.niche, 'i');
    }

    if (query.language) {
      filter.language = query.language;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.currentStage) {
      filter.currentStage = query.currentStage;
    }

    if (query.ownerId && Types.ObjectId.isValid(query.ownerId)) {
      filter.ownerId = new Types.ObjectId(query.ownerId);
    }

    return filter;
  }
}
