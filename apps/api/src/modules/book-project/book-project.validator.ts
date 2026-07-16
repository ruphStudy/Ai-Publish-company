import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Category } from '../category/entities/category.entity';
import { Subcategory } from '../category/entities/subcategory.entity';

export interface BookProjectValidationResult {
  valid: boolean;
  errors: string[];
}

@Injectable()
export class BookProjectValidator {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<Category>,
    @InjectModel(Subcategory.name)
    private readonly subcategoryModel: Model<Subcategory>,
  ) {}

  async validateReferences(
    categoryId: string,
    subCategoryId?: string,
  ): Promise<BookProjectValidationResult> {
    const errors: string[] = [];

    if (!Types.ObjectId.isValid(categoryId)) {
      errors.push('categoryId must be a valid MongoDB ObjectId');
      return { valid: false, errors };
    }

    const category = await this.categoryModel.findById(categoryId).lean().exec();

    if (!category) {
      errors.push(`Category "${categoryId}" was not found`);
    }

    if (subCategoryId) {
      if (!Types.ObjectId.isValid(subCategoryId)) {
        errors.push('subCategoryId must be a valid MongoDB ObjectId');
      } else {
        const subcategory = await this.subcategoryModel
          .findOne({
            _id: new Types.ObjectId(subCategoryId),
            categoryId: new Types.ObjectId(categoryId),
          })
          .lean()
          .exec();

        if (!subcategory) {
          errors.push(
            `Subcategory "${subCategoryId}" was not found for category "${categoryId}"`,
          );
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateMetadata(metadata: Record<string, unknown>): BookProjectValidationResult {
    try {
      JSON.stringify(metadata);

      return {
        valid: true,
        errors: [],
      };
    } catch {
      return {
        valid: false,
        errors: ['metadata must be JSON-compatible'],
      };
    }
  }
}