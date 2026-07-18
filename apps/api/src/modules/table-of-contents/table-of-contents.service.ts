import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AIWritingService } from '../ai-writing/ai-writing.service';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { BookMetadataService } from '../book-metadata/book-metadata.service';
import { BookProjectService } from '../book-project/book-project.service';
import { OutlineService } from '../outline/outline.service';
import {
  GenerateTableOfContentsDto,
  TableOfContentsQueryDto,
  UpdateTableOfContentsDto,
} from './dto';
import {
  TableOfContents,
  TableOfContentsDocument,
} from './entities/table-of-contents.entity';
import { TableOfContentsEngine } from './table-of-contents.engine';
import { TOCFactory } from './table-of-contents.factory';
import { TOCMapper } from './table-of-contents.mapper';
import { TableOfContentsRepository } from './table-of-contents.repository';
import { TOCValidator } from './table-of-contents.validator';

@Injectable()
export class TableOfContentsService {
  constructor(
    private readonly projectService: BookProjectService,
    private readonly blueprintService: BookBlueprintService,
    private readonly outlineService: OutlineService,
    private readonly metadataService: BookMetadataService,
    private readonly aiWritingService: AIWritingService,
    private readonly repository: TableOfContentsRepository,
    private readonly validator: TOCValidator,
    private readonly engine: TableOfContentsEngine,
    private readonly factory: TOCFactory,
    private readonly mapper: TOCMapper,
  ) {}

  async generate(dto: GenerateTableOfContentsDto) {
    const [project, blueprint, metadata] = await Promise.all([
      this.projectService.findOne(dto.projectId),
      this.blueprintService.findOne(dto.blueprintId),
      this.metadataService.findOne(dto.metadataId),
    ]);

    const [outline, contents] = await Promise.all([
      this.outlineService.latestOutline(dto.blueprintId),
      this.aiWritingService.findByProjectId(dto.projectId),
    ]);

    const projectData = project as unknown as Record<string, unknown>;
    const blueprintData = blueprint as unknown as Record<string, unknown>;
    const outlineData = outline as unknown as Record<string, unknown>;
    const metadataData = metadata as unknown as Record<string, unknown>;
    const contentData = contents as unknown as Record<string, unknown>[];

    this.validator.validateProject(projectData);
    this.validator.validateBlueprint(blueprintData);
    this.validator.validateOutline(outlineData);
    this.validator.validateMetadata(metadataData);
    this.validator.validateState(
      projectData,
      blueprintData,
      outlineData,
      metadataData,
    );
    this.validator.validateContents(contentData);

    const generated = this.engine.generate(contentData);
    const toc = await this.repository.create(
      this.factory.create(
        projectData,
        blueprintData,
        metadataData,
        generated,
        dto.generatedBy,
      ),
    );

    return this.mapper.toResponse(toc);
  }

  async regenerate(id: string, generatedBy?: string) {
    const toc = await this.findDocument(id);

    return this.generate({
      projectId: toc.projectId,
      blueprintId: toc.blueprintId,
      metadataId: toc.metadataId,
      generatedBy,
    });
  }

  async findOne(id: string) {
    return this.mapper.toResponse(await this.findDocument(id));
  }

  async findByProjectId(projectId: string) {
    const tocs = await this.repository.findByProjectId(projectId);

    return tocs.map((toc) => this.mapper.toResponse(toc));
  }

  async latestTOC(projectId: string) {
    const toc = await this.repository.latestTOC(projectId);

    if (!toc) {
      throw new NotFoundException('Table of contents not found');
    }

    return this.mapper.toResponse(toc);
  }

  async search(query: TableOfContentsQueryDto) {
    const filter: FilterQuery<TableOfContents> = {};

    if (query.projectId) {
      filter.projectId = query.projectId;
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

  async update(id: string, dto: UpdateTableOfContentsDto) {
    const current = await this.findDocument(id);

    this.validator.validateUpdate(current.status);

    const updated = await this.repository.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Table of contents not found');
    }

    return this.mapper.toResponse(updated);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const toc = await this.repository.softDelete(id, deletedBy);

    if (!toc) {
      throw new NotFoundException('Table of contents not found');
    }
  }

  async restore(id: string) {
    const toc = await this.repository.restore(id);

    if (!toc) {
      throw new NotFoundException('Deleted table of contents not found');
    }

    return this.mapper.toResponse(toc);
  }

  private async findDocument(id: string): Promise<TableOfContentsDocument> {
    const toc = await this.repository.findById(id);

    if (!toc) {
      throw new NotFoundException('Table of contents not found');
    }

    return toc;
  }
}
