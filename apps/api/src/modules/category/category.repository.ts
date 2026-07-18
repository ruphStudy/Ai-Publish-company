import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model} from 'mongoose';
import { Types } from 'mongoose';

import { Category } from './entities/category.entity';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto';

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

/** Fields excluded from all public API responses */
const PROJECTION = '-isDeleted -deletedAt -deletedBy -__v' as const;

/** Escape special regex characters from user-supplied strings */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
  ) {}

  async create(
    data: CreateCategoryDto & { slug: string; displayOrder: number },
    userId: Types.ObjectId,
  ): Promise<Category> {
    const category = new this.categoryModel({ ...data, createdBy: userId });
    return category.save();
  }

  async findAll(query: CategoryQueryDto): Promise<PaginatedResult<Category>> {
    const {
      search,
      status,
      sortBy = 'displayOrder',
      sortOrder = 'asc',
      page = 1,
      limit = 10,
    } = query;

    const filter: FilterQuery<Category> = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (status !== undefined) {
      filter.status = status;
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(PROJECTION)
        .lean()
        .exec(),
      this.categoryModel.countDocuments(filter).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: data as unknown as Category[],
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

  async findById(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.categoryModel
      .findById(id)
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Category | null;
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return this.categoryModel
      .findOne({ slug })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Category | null;
  }

  async findByName(name: string): Promise<Category | null> {
    return this.categoryModel
      .findOne({ name: new RegExp(`^${escapeRegex(name)}$`, 'i') })
      .select('_id name')
      .lean()
      .exec() as unknown as Category | null;
  }

  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<Category> = { slug };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.categoryModel.countDocuments(filter).exec()) > 0;
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const filter: FilterQuery<Category> = {
      name: new RegExp(`^${escapeRegex(name)}$`, 'i'),
    };
    if (excludeId && Types.ObjectId.isValid(excludeId)) {
      filter._id = { $ne: new Types.ObjectId(excludeId) };
    }
    return (await this.categoryModel.countDocuments(filter).exec()) > 0;
  }

  async update(
    id: string,
    data: UpdateCategoryDto & { slug?: string },
    userId: Types.ObjectId,
  ): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.categoryModel
      .findByIdAndUpdate(id, { ...data, updatedBy: userId }, { new: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Category | null;
  }

  async softDelete(id: string, userId: Types.ObjectId): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) return false;

    const result = await this.categoryModel
      .updateOne(
        { _id: id },
        { isDeleted: true, deletedAt: new Date(), deletedBy: userId },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async restore(id: string): Promise<Category | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return this.categoryModel
      .findOneAndUpdate(
        { _id: id },
        { isDeleted: false, deletedAt: null, deletedBy: null },
        { new: true },
      )
      .setOptions({ includeDeleted: true })
      .select(PROJECTION)
      .lean()
      .exec() as unknown as Category | null;
  }

  /**
   * Returns the next available displayOrder value (highest existing + 1, or 0).
   */
  async getNextDisplayOrder(): Promise<number> {
    const last = await this.categoryModel
      .findOne()
      .sort({ displayOrder: -1 })
      .select('displayOrder')
      .lean()
      .exec();

    return last ? last.displayOrder + 1 : 0;
  }
}
