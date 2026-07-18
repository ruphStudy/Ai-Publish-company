import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AIWritingService } from '../ai-writing/ai-writing.service';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { BookProjectService } from '../book-project/book-project.service';
import { CreateQualityReviewDto, QualityReviewQueryDto, UpdateQualityReviewDto } from './dto';
import { QualityReview, QualityReviewDocument } from './entities/quality-review.entity';
import { QualityReviewEngine } from './quality-review.engine';
import { QualityReviewFactory } from './quality-review.factory';
import { QualityReviewMapper } from './quality-review.mapper';
import { QualityReviewRepository } from './quality-review.repository';
import { QualityReviewValidator } from './quality-review.validator';

@Injectable()
export class QualityReviewService {
  constructor(
    private readonly projectService: BookProjectService,
    private readonly blueprintService: BookBlueprintService,
    private readonly writingService: AIWritingService,
    private readonly repository: QualityReviewRepository,
    private readonly engine: QualityReviewEngine,
    private readonly factory: QualityReviewFactory,
    private readonly validator: QualityReviewValidator,
    private readonly mapper: QualityReviewMapper,
  ) {}

  async create(dto: CreateQualityReviewDto) {
    const [project, blueprint, contents, latest] = await Promise.all([
      this.projectService.findOne(dto.projectId),
      this.blueprintService.findOne(dto.blueprintId),
      this.writingService.findByProjectId(dto.projectId),
      this.repository.latestReview(dto.projectId),
    ]);
    if (String(blueprint.projectId) !== String(project.id)) throw new NotFoundException('Blueprint does not belong to the project');
    const input = {
      projectId: dto.projectId,
      blueprintId: dto.blueprintId,
      chapters: contents.map((content) => ({
        id: String(content.id),
        chapterNumber: Number(content.chapterNumber),
        chapterTitle: String(content.chapterTitle),
        markdown: String(content.markdownContent ?? content.generatedContent ?? ''),
        plainText: String(content.plainTextContent ?? content.generatedContent ?? ''),
        wordCount: Number(content.generatedWordCount ?? 0),
      })),
    };
    this.validator.validateInput(input);
    const reviewVersion = `${(latest ? Number(latest.reviewVersion.replace(/^v/, '')) : 0) + 1}`;
    const review = this.factory.create(input, this.engine.review(input), `v${reviewVersion}`, dto.createdBy);
    return this.mapper.toResponse(await this.repository.create(review));
  }

  async update(id: string, dto: UpdateQualityReviewDto) {
    const current = await this.findDocument(id);
    this.validator.validateStatus(current.status, dto.status);
    const updated = await this.repository.update(id, dto);
    if (!updated) throw new NotFoundException('Quality review not found');
    return this.mapper.toResponse(updated);
  }

  async findById(id: string) { return this.mapper.toResponse(await this.findDocument(id)); }
  async findByProjectId(projectId: string) { return (await this.repository.findByProjectId(projectId)).map((item) => this.mapper.toResponse(item)); }
  async latestReview(projectId: string) { const item = await this.repository.latestReview(projectId); if (!item) throw new NotFoundException('Quality review not found'); return this.mapper.toResponse(item); }

  async search(query: QualityReviewQueryDto) {
    const filter: FilterQuery<QualityReview> = {};
    if (query.projectId) filter.projectId = query.projectId;
    if (query.status) filter.status = query.status;
    if (query.publicationReadiness) filter.publicationReadiness = query.publicationReadiness;
    const result = await this.repository.paginate(filter, query.page, query.limit);
    return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) };
  }

  private async findDocument(id: string): Promise<QualityReviewDocument> { const item = await this.repository.findById(id); if (!item) throw new NotFoundException('Quality review not found'); return item; }
}
