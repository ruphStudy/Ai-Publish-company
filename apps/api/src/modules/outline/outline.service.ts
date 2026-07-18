import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import {
  GenerateOutlineDto,
  OutlineQueryDto,
  OutlineResponseDto,
  UpdateOutlineDto,
} from './dto';
import { Outline, OutlineDocument } from './entities/outline.entity';
import { OutlineGenerationPipeline } from './outline-generation.pipeline';
import { OutlineMapper } from './outline.mapper';
import { OutlineRepository } from './outline.repository';
import { OutlineValidator } from './outline.validator';

@Injectable()
export class OutlineService {
  private readonly logger = new Logger(OutlineService.name);

  constructor(
    private readonly bookBlueprintService: BookBlueprintService,
    private readonly outlineRepository: OutlineRepository,
    private readonly outlineValidator: OutlineValidator,
    private readonly outlinePipeline: OutlineGenerationPipeline,
    private readonly outlineMapper: OutlineMapper,
  ) {}

  async generate(
    dto: GenerateOutlineDto,
  ): Promise<OutlineResponseDto> {
    const blueprint = await this.bookBlueprintService.findOne(dto.blueprintId);

    this.outlineValidator.validateBlueprint(
      blueprint as unknown as Record<string, unknown>,
    );

    const outlineData = await this.outlinePipeline.execute(
      blueprint as unknown as Record<string, unknown>,
      dto.generatedBy,
    );

    const outline = await this.outlineRepository.create(outlineData);

    this.logger.log(`Outline generated: ${outline.outlineId}`);

    return this.outlineMapper.toResponse(outline);
  }

  async findOne(id: string): Promise<OutlineResponseDto> {
    const outline = await this.findDocument(id);

    return this.outlineMapper.toResponse(outline);
  }

  async findByBlueprintId(
    blueprintId: string,
  ): Promise<OutlineResponseDto[]> {
    const outlines = await this.outlineRepository.findByBlueprintId(blueprintId);

    return outlines.map((outline) => this.outlineMapper.toResponse(outline));
  }

  async latestOutline(blueprintId: string): Promise<OutlineResponseDto> {
    const outline = await this.outlineRepository.latestOutline(blueprintId);

    if (!outline) {
      throw new NotFoundException('Outline not found for this blueprint');
    }

    return this.outlineMapper.toResponse(outline);
  }

  async search(query: OutlineQueryDto) {
    const filter: FilterQuery<Outline> = {};

    if (query.blueprintId) {
      filter.blueprintId = query.blueprintId;
    }

    if (query.projectId) {
      filter.projectId = query.projectId;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      filter.$text = { $search: query.search.trim() };
    }

    const result = await this.outlineRepository.search(
      filter,
      query.page ?? 1,
      query.limit ?? 20,
    );

    return {
      ...result,
      items: result.items.map((item) => this.outlineMapper.toResponse(item)),
    };
  }

  async update(
    id: string,
    dto: UpdateOutlineDto,
  ): Promise<OutlineResponseDto> {
    const current = await this.findDocument(id);

    this.outlineValidator.validateUpdate(current.status, dto.status);

    const updated = await this.outlineRepository.update(id, {
      ...dto,
      updatedBy: dto.updatedBy,
    });

    if (!updated) {
      throw new NotFoundException('Outline not found');
    }

    return this.outlineMapper.toResponse(updated);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    const deleted = await this.outlineRepository.softDelete(id, deletedBy);

    if (!deleted) {
      throw new NotFoundException('Outline not found');
    }
  }

  async restore(id: string): Promise<OutlineResponseDto> {
    const restored = await this.outlineRepository.restore(id);

    if (!restored) {
      throw new NotFoundException('Deleted outline not found');
    }

    return this.outlineMapper.toResponse(restored);
  }

  private async findDocument(id: string): Promise<OutlineDocument> {
    const outline = await this.outlineRepository.findById(id);

    if (!outline) {
      throw new NotFoundException('Outline not found');
    }

    return outline;
  }
}
