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
  CoverPromptQueryDto,
  GenerateCoverPromptDto,
  RegenerateCoverPromptDto,
  UpdateCoverPromptDto,
} from './dto';
import {
  CoverPrompt,
  CoverPromptDocument,
} from './entities/cover-prompt.entity';
import { CoverPromptEngine } from './cover-prompt.engine';
import { CoverPromptFactory } from './cover-prompt.factory';
import { CoverPromptMapper } from './cover-prompt.mapper';
import { CoverPromptRepository } from './cover-prompt.repository';
import { CoverPromptValidator } from './cover-prompt.validator';

@Injectable()
export class CoverPromptService {
  constructor(
    private readonly projectService: BookProjectService,
    private readonly blueprintService: BookBlueprintService,
    private readonly outlineService: OutlineService,
    private readonly aiWritingService: AIWritingService,
    private readonly metadataService: BookMetadataService,
    private readonly repository: CoverPromptRepository,
    private readonly validator: CoverPromptValidator,
    private readonly engine: CoverPromptEngine,
    private readonly factory: CoverPromptFactory,
    private readonly mapper: CoverPromptMapper,
  ) {}

  async generate(dto: GenerateCoverPromptDto) {
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

    this.validator.validateProject(projectData);
    this.validator.validateBlueprint(blueprintData);
    this.validator.validateOutline(outlineData);
    this.validator.validateMetadata(metadataData);
    this.validator.validateProjectState(
      projectData,
      blueprintData,
      outlineData,
      metadataData,
    );

    const generated = this.engine.generate(blueprintData, metadataData);
    const document = await this.repository.create(
      this.factory.create(
        projectData,
        blueprintData,
        metadataData,
        {
          ...generated,
          manuscriptChapterCount: contents.length,
        },
        dto.generatedBy,
      ),
    );

    return this.mapper.toResponse(document);
  }

  async regenerate(id: string, dto: RegenerateCoverPromptDto) {
    const current = await this.findDocument(id);

    return this.generate({
      projectId: current.projectId,
      blueprintId: current.blueprintId,
      metadataId: current.metadataId,
      generatedBy: dto.generatedBy,
    });
  }

  async findOne(id: string) {
    return this.mapper.toResponse(await this.findDocument(id));
  }

  async findByProjectId(projectId: string) {
    const prompts = await this.repository.findByProjectId(projectId);

    return prompts.map((prompt) => this.mapper.toResponse(prompt));
  }

  async latestPrompt(projectId: string) {
    const prompt = await this.repository.latestPrompt(projectId);

    if (!prompt) {
      throw new NotFoundException('Cover prompt not found');
    }

    return this.mapper.toResponse(prompt);
  }

  async search(query: CoverPromptQueryDto) {
    const filter: FilterQuery<CoverPrompt> = {};

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

  async update(id: string, dto: UpdateCoverPromptDto) {
    const current = await this.findDocument(id);

    this.validator.validateUpdate(current.status);

    const updated = await this.repository.update(id, dto);

    if (!updated) {
      throw new NotFoundException('Cover prompt not found');
    }

    return this.mapper.toResponse(updated);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const prompt = await this.repository.softDelete(id, deletedBy);

    if (!prompt) {
      throw new NotFoundException('Cover prompt not found');
    }
  }

  async restore(id: string) {
    const prompt = await this.repository.restore(id);

    if (!prompt) {
      throw new NotFoundException('Deleted cover prompt not found');
    }

    return this.mapper.toResponse(prompt);
  }

  private async findDocument(id: string): Promise<CoverPromptDocument> {
    const prompt = await this.repository.findById(id);

    if (!prompt) {
      throw new NotFoundException('Cover prompt not found');
    }

    return prompt;
  }
}
