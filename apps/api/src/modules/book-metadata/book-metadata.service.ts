import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { BookProjectService } from '../book-project/book-project.service';
import { OutlineService } from '../outline/outline.service';
import { AIWritingService } from '../ai-writing/ai-writing.service';
import {
  BookMetadataQueryDto,
  GenerateBookMetadataDto,
  RegenerateBookMetadataDto,
  UpdateBookMetadataDto,
} from './dto';
import {
  BookMetadata,
  BookMetadataDocument,
} from './entities/book-metadata.entity';
import { BookMetadataPipeline } from './book-metadata.pipeline';
import { MetadataMapper } from './book-metadata.mapper';
import { BookMetadataRepository } from './book-metadata.repository';
import { MetadataValidator } from './book-metadata.validator';

@Injectable()
export class BookMetadataService {
  constructor(
    private readonly projectService: BookProjectService,
    private readonly blueprintService: BookBlueprintService,
    private readonly outlineService: OutlineService,
    private readonly aiWritingService: AIWritingService,
    private readonly repository: BookMetadataRepository,
    private readonly validator: MetadataValidator,
    private readonly pipeline: BookMetadataPipeline,
    private readonly mapper: MetadataMapper,
  ) {}

  async generate(dto: GenerateBookMetadataDto) {
    const [project, blueprint] = await Promise.all([
      this.projectService.findOne(dto.projectId),
      this.blueprintService.findOne(dto.blueprintId),
    ]);

    const projectData = project as unknown as Record<string, unknown>;
    const blueprintData = blueprint as unknown as Record<string, unknown>;
    const outline = await this.outlineService.latestOutline(dto.blueprintId);
    const contents = await this.aiWritingService.findByProjectId(dto.projectId);

    const outlineData = outline as unknown as Record<string, unknown>;
    const contentData = contents as unknown as Record<string, unknown>[];

    this.validator.validateProject(projectData);
    this.validator.validateBlueprint(blueprintData);
    this.validator.validateOutline(outlineData);
    this.validator.validateProjectState(
      projectData,
      blueprintData,
      outlineData,
    );
    this.validator.validateContent(contentData);

    const metadata = await this.pipeline.execute(
      projectData,
      blueprintData,
      outlineData,
      contentData,
      dto.generatedBy,
    );

    return this.mapper.toResponse(await this.repository.create(metadata));
  }

  async regenerate(id: string, dto: RegenerateBookMetadataDto) {
    const current = await this.findDocument(id);

    return this.generate({
      projectId: current.projectId,
      blueprintId: current.blueprintId,
      generatedBy: dto.generatedBy,
    });
  }

  async findOne(id: string) {
    return this.mapper.toResponse(await this.findDocument(id));
  }

  async findByProjectId(projectId: string) {
    const records = await this.repository.findByProjectId(projectId);

    return records.map((record) => this.mapper.toResponse(record));
  }

  async latestMetadata(projectId: string) {
    const metadata = await this.repository.latestMetadata(projectId);

    if (!metadata) {
      throw new NotFoundException('Book metadata not found');
    }

    return this.mapper.toResponse(metadata);
  }

  async search(query: BookMetadataQueryDto) {
    const filter: FilterQuery<BookMetadata> = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.blueprintId) {
      filter.blueprintId = query.blueprintId;
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
      items: result.items.map((item) => this.mapper.toResponse(item)),
    };
  }

  async update(id: string, dto: UpdateBookMetadataDto) {
    const current = await this.findDocument(id);

    this.validator.validateUpdate(current.status);

    const updated = await this.repository.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Book metadata not found');
    }

    return this.mapper.toResponse(updated);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const metadata = await this.repository.softDelete(id, deletedBy);

    if (!metadata) {
      throw new NotFoundException('Book metadata not found');
    }
  }

  async restore(id: string) {
    const metadata = await this.repository.restore(id);

    if (!metadata) {
      throw new NotFoundException('Deleted book metadata not found');
    }

    return this.mapper.toResponse(metadata);
  }

  private async findDocument(id: string): Promise<BookMetadataDocument> {
    const metadata = await this.repository.findById(id);

    if (!metadata) {
      throw new NotFoundException('Book metadata not found');
    }

    return metadata;
  }
}
