import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { OutlineService } from '../outline/outline.service';
import {
  ChapterQueryDto,
  GenerateChapterDto,
  UpdateChapterDto,
} from './dto';
import { Chapter, ChapterDocument } from './entities/chapter.entity';
import { ChapterGenerationPipeline } from './chapter-generation.pipeline';
import { ChapterMapper } from './chapter.mapper';
import { ChapterGeneratorRepository } from './chapter-generator.repository';
import { ChapterValidator } from './chapter.validator';

@Injectable()
export class ChapterGeneratorService {
  constructor(
    private readonly blueprintService: BookBlueprintService,
    private readonly outlineService: OutlineService,
    private readonly repository: ChapterGeneratorRepository,
    private readonly validator: ChapterValidator,
    private readonly pipeline: ChapterGenerationPipeline,
    private readonly mapper: ChapterMapper,
  ) {}

  async generate(dto: GenerateChapterDto) {
    const [blueprint, outline] = await Promise.all([
      this.blueprintService.findOne(dto.blueprintId),
      this.outlineService.findOne(dto.outlineId),
    ]);

    const blueprintData = blueprint as unknown as Record<string, unknown>;
    const outlineData = outline as unknown as Record<string, unknown>;

    this.validator.validateBlueprint(blueprintData);
    this.validator.validateOutline(outlineData);

    if (String(outlineData.projectId) !== String(blueprintData.projectId)) {
      throw new NotFoundException(
        'Outline does not belong to the selected book project',
      );
    }

    const chapterOutline = this.validator.validateChapterOutline(
      outlineData,
      dto.chapterNumber,
    );

    const data = await this.pipeline.execute(
      blueprintData,
      outlineData,
      chapterOutline,
      dto.chapterNumber,
      dto.generatedBy,
    );

    const chapter = await this.repository.create(data);

    return this.mapper.toResponse(chapter);
  }

  async findOne(id: string) {
    return this.mapper.toResponse(await this.findDocument(id));
  }

  async findByProjectId(projectId: string) {
    const chapters = await this.repository.findByProjectId(projectId);

    return chapters.map((chapter) => this.mapper.toResponse(chapter));
  }

  async findByOutlineId(outlineId: string) {
    const chapters = await this.repository.findByOutlineId(outlineId);

    return chapters.map((chapter) => this.mapper.toResponse(chapter));
  }

  async latestChapter(outlineId: string, chapterNumber: number) {
    const chapter = await this.repository.latestChapter(outlineId, chapterNumber);

    if (!chapter) {
      throw new NotFoundException('Chapter blueprint not found');
    }

    return this.mapper.toResponse(chapter);
  }

  async search(query: ChapterQueryDto) {
    const filter: FilterQuery<Chapter> = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.blueprintId) {
      filter.blueprintId = query.blueprintId;
    }

    if (query.outlineId) {
      filter.outlineId = query.outlineId;
    }

    if (query.status) {
      filter.status = query.status;
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
      items: result.items.map((chapter) => this.mapper.toResponse(chapter)),
    };
  }

  async update(id: string, dto: UpdateChapterDto) {
    const current = await this.findDocument(id);

    this.validator.validateUpdate(current.status);

    const updated = await this.repository.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Chapter blueprint not found');
    }

    return this.mapper.toResponse(updated);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const chapter = await this.repository.softDelete(id, deletedBy);

    if (!chapter) {
      throw new NotFoundException('Chapter blueprint not found');
    }
  }

  async restore(id: string) {
    const chapter = await this.repository.restore(id);

    if (!chapter) {
      throw new NotFoundException('Deleted chapter blueprint not found');
    }

    return this.mapper.toResponse(chapter);
  }

  private async findDocument(id: string): Promise<ChapterDocument> {
    const chapter = await this.repository.findById(id);

    if (!chapter) {
      throw new NotFoundException('Chapter blueprint not found');
    }

    return chapter;
  }
}
