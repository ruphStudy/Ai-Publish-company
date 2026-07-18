import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { ChapterGeneratorService } from '../chapter-generator/chapter-generator.service';
import { OutlineService } from '../outline/outline.service';
import {
  ContentQueryDto,
  GenerateContentDto,
  RegenerateChapterDto,
  RegenerateSectionDto,
} from './dto';
import {
  BookContent,
  BookContentDocument} from './entities/book-content.entity';
import {
  ContentGenerationStatus,
} from './entities/book-content.entity';
import { AIWritingPipeline } from './ai-writing.pipeline';
import { AIWritingMapper } from './ai-writing.mapper';
import { AIWritingRepository } from './ai-writing.repository';
import { AIWritingValidator } from './ai-writing.validator';

@Injectable()
export class AIWritingService {
  constructor(
    private readonly blueprintService: BookBlueprintService,
    private readonly outlineService: OutlineService,
    private readonly chapterService: ChapterGeneratorService,
    private readonly repository: AIWritingRepository,
    private readonly validator: AIWritingValidator,
    private readonly pipeline: AIWritingPipeline,
    private readonly mapper: AIWritingMapper,
  ) {}

  async generate(dto: GenerateContentDto) {
    const [blueprint, outline, chapter] = await Promise.all([
      this.blueprintService.findOne(dto.blueprintId),
      this.outlineService.findOne(dto.outlineId),
      this.chapterService.findOne(dto.chapterId),
    ]);

    const blueprintData = blueprint as unknown as Record<string, unknown>;
    const outlineData = outline as unknown as Record<string, unknown>;
    const chapterData = chapter as unknown as Record<string, unknown>;

    this.validator.validateBlueprint(blueprintData);
    this.validator.validateOutline(outlineData);
    this.validator.validateChapter(chapterData);
    this.validator.validateProjectState(
      blueprintData,
      outlineData,
      chapterData,
    );

    const data = await this.pipeline.generateChapter(
      blueprintData,
      outlineData,
      chapterData,
      dto.generatedBy,
    );

    return this.mapper.toResponse(await this.repository.create(data));
  }

  async regenerateChapter(
    id: string,
    dto: RegenerateChapterDto,
  ) {
    const current = await this.findDocument(id);

    const generated = await this.generate({
      blueprintId: current.blueprintId,
      outlineId: current.outlineId,
      chapterId: current.chapterId,
      generatedBy: dto.generatedBy,
    });

    await this.repository.update(id, {
      status: ContentGenerationStatus.REGENERATED,
      updatedBy: dto.generatedBy,
    });

    return generated;
  }

  async regenerateSection(
    id: string,
    dto: RegenerateSectionDto,
  ) {
    const content = await this.findDocument(id);
    const section = content.chapterContent.sections.find(
      (item) => item.sectionNumber === dto.sectionNumber,
    );

    if (!section) {
      throw new BadRequestException('Content section not found');
    }

    const updated = await this.repository.update(id, {
      status: ContentGenerationStatus.REVIEW_REQUIRED,
      updatedBy: dto.generatedBy,
      metadata: {
        ...content.metadata,
        lastRegeneratedSection: dto.sectionNumber,
        regenerationInstruction: dto.instruction,
        regeneratedAt: new Date().toISOString(),
      },
    });

    if (!updated) {
      throw new NotFoundException('Book content not found');
    }

    return this.mapper.toResponse(updated);
  }

  async findOne(id: string) {
    return this.mapper.toResponse(await this.findDocument(id));
  }

  async findByProjectId(projectId: string) {
    const contents = await this.repository.findByProjectId(projectId);

    return contents.map((content) => this.mapper.toResponse(content));
  }

  async findByChapterId(chapterId: string) {
    const contents = await this.repository.findByChapterId(chapterId);

    return contents.map((content) => this.mapper.toResponse(content));
  }

  async latestVersion(chapterId: string) {
    const content = await this.repository.latestVersion(chapterId);

    if (!content) {
      throw new NotFoundException('Book content not found');
    }

    return this.mapper.toResponse(content);
  }

  async search(query: ContentQueryDto) {
    const filter: FilterQuery<BookContent> = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.chapterId) {
      filter.chapterId = query.chapterId;
    }

    if (query.search) {
      filter.$text = { $search: query.search.trim() };
    }

    const result = await this.repository.search(
      filter,
      query.page,
      query.limit,
    );

    return {
      ...result,
      items: result.items.map((item) => this.mapper.toResponse(item)),
    };
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const content = await this.repository.softDelete(id, deletedBy);

    if (!content) {
      throw new NotFoundException('Book content not found');
    }
  }

  async restore(id: string) {
    const content = await this.repository.restore(id);

    if (!content) {
      throw new NotFoundException('Deleted book content not found');
    }

    return this.mapper.toResponse(content);
  }

  private async findDocument(id: string): Promise<BookContentDocument> {
    const content = await this.repository.findById(id);

    if (!content) {
      throw new NotFoundException('Book content not found');
    }

    return content;
  }
}
