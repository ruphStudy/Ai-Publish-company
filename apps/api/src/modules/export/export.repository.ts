import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, UpdateQuery } from 'mongoose';
import type { ExportJobDocument } from './entities/export-job.entity';
import { ExportJob } from './entities/export-job.entity';
import { ExportRepositoryInterface } from './interfaces/export.repository.interface';

@Injectable()
export class ExportRepository implements ExportRepositoryInterface {
  constructor(
    @InjectModel(ExportJob.name)
    private readonly exportJobModel: Model<ExportJob>,
  ) {}

  create(data: Partial<ExportJob>): Promise<ExportJobDocument> {
    return this.exportJobModel.create(data);
  }

  update(
    id: string,
    data: UpdateQuery<ExportJob>,
  ): Promise<ExportJobDocument | null> {
    return this.exportJobModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  findById(id: string): Promise<ExportJobDocument | null> {
    return this.exportJobModel.findById(id).exec();
  }

  softDelete(id: string, deletedBy?: string): Promise<ExportJobDocument | null> {
    return this.exportJobModel.findByIdAndUpdate(id, {
      isDeleted: true, deletedAt: new Date(), deletedBy,
    }, { new: true }).exec();
  }

  restore(id: string): Promise<ExportJobDocument | null> {
    return this.exportJobModel.findOneAndUpdate(
      { _id: id, isDeleted: true },
      { isDeleted: false, $unset: { deletedAt: 1, deletedBy: 1 } },
      { new: true },
    ).exec();
  }

  findByProjectId(projectId: string): Promise<ExportJobDocument[]> {
    return this.exportJobModel.find({ projectId }).sort({ createdAt: -1 }).exec();
  }

  latestExport(projectId: string): Promise<ExportJobDocument | null> {
    return this.exportJobModel.findOne({ projectId }).sort({ createdAt: -1 }).exec();
  }

  async search(
    filter: FilterQuery<ExportJob>,
    page: number,
    limit: number,
  ) {
    const [items, total] = await Promise.all([
      this.exportJobModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.exportJobModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async exists(filter: FilterQuery<ExportJob>): Promise<boolean> {
    return (await this.exportJobModel.exists(filter)) !== null;
  }
}
