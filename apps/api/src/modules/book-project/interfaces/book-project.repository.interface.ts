import { Types } from 'mongoose';

import {
  BookProjectQueryDto,
  CreateBookProjectDto,
  UpdateBookProjectDto,
} from '../dto';
import { BookProject } from '../entities/book-project.entity';

export interface PaginatedBookProjectResult {
  data: BookProject[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface BookProjectRepositoryInterface {
  create(
    data: CreateBookProjectDto & {
      projectCode: string;
      ownerId: Types.ObjectId;
    },
    userId: Types.ObjectId,
  ): Promise<BookProject>;
  update(
    id: string,
    data: UpdateBookProjectDto,
    userId: Types.ObjectId,
  ): Promise<BookProject | null>;
  delete(id: string, userId: Types.ObjectId): Promise<boolean>;
  softDelete(id: string, userId: Types.ObjectId): Promise<boolean>;
  restore(id: string): Promise<BookProject | null>;
  findById(id: string): Promise<BookProject | null>;
  findByProjectCode(projectCode: string): Promise<BookProject | null>;
  search(query: BookProjectQueryDto): Promise<PaginatedBookProjectResult>;
  filter(query: BookProjectQueryDto): Promise<PaginatedBookProjectResult>;
  paginate(query: BookProjectQueryDto): Promise<PaginatedBookProjectResult>;
  existsByProjectCode(projectCode: string): Promise<boolean>;
  count(query?: BookProjectQueryDto): Promise<number>;
}