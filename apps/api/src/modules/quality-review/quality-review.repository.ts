import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import { QualityReview, QualityReviewDocument } from './entities/quality-review.entity';
import { PaginatedQualityReviewResult, QualityReviewRepositoryInterface } from './interfaces/quality-review.repository.interface';

@Injectable()
export class QualityReviewRepository implements QualityReviewRepositoryInterface {
  constructor(@InjectModel(QualityReview.name) private readonly model: Model<QualityReview>) {}

  create(data: Partial<QualityReview>): Promise<QualityReviewDocument> { return this.model.create(data); }
  update(id: string, data: UpdateQuery<QualityReview>): Promise<QualityReviewDocument | null> { return this.model.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true, runValidators: true }).exec(); }
  findById(id: string): Promise<QualityReviewDocument | null> { return this.model.findOne({ _id: id, isDeleted: false }).exec(); }
  findByProjectId(projectId: string): Promise<QualityReviewDocument[]> { return this.model.find({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }
  latestReview(projectId: string): Promise<QualityReviewDocument | null> { return this.model.findOne({ projectId, isDeleted: false }).sort({ createdAt: -1 }).exec(); }

  async search(filter: FilterQuery<QualityReview>, page: number, limit: number): Promise<PaginatedQualityReviewResult> {
    const query = { ...filter, isDeleted: false };
    const [items, total] = await Promise.all([
      this.model.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(query).exec(),
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  paginate(filter: FilterQuery<QualityReview>, page: number, limit: number): Promise<PaginatedQualityReviewResult> {
    return this.search(filter, page, limit);
  }
}
