import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AIWritingService } from '../ai-writing/ai-writing.service';
import { BookBlueprintService } from '../book-blueprint/book-blueprint.service';
import { BookMetadataService } from '../book-metadata/book-metadata.service';
import { BookProjectService } from '../book-project/book-project.service';
import { CoverPromptService } from '../cover-prompt/cover-prompt.service';
import { TableOfContentsService } from '../table-of-contents/table-of-contents.service';
import { ExportJobStatus } from './entities/export-job.entity';
import { ExportFactory } from './export.factory';
import { ExportMapper } from './export.mapper';
import { ExportPipeline } from './export.pipeline';
import { ExportRepository } from './export.repository';
import { ExportValidator } from './export.validator';
import { CreateExportDto, ExportQueryDto } from './dto';

@Injectable()
export class ExportService {
  constructor(
    private readonly projectService: BookProjectService,
    private readonly blueprintService: BookBlueprintService,
    private readonly metadataService: BookMetadataService,
    private readonly tocService: TableOfContentsService,
    private readonly coverPromptService: CoverPromptService,
    private readonly aiWritingService: AIWritingService,
    private readonly repository: ExportRepository,
    private readonly validator: ExportValidator,
    private readonly factory: ExportFactory,
    private readonly pipeline: ExportPipeline,
    private readonly mapper: ExportMapper,
  ) {}

  async create(dto: CreateExportDto) {
    const [project, blueprint, metadata, toc, coverPrompt, contents] =
      await Promise.all([
        this.projectService.findOne(dto.projectId),
        this.blueprintService.findOne(dto.blueprintId),
        this.metadataService.findOne(dto.metadataId),
        this.tocService.findOne(dto.tocId),
        this.coverPromptService.findOne(dto.coverPromptId),
        this.aiWritingService.findByProjectId(dto.projectId),
      ]);

    this.validator.validate(
      project,
      blueprint,
      metadata,
      toc,
      contents,
    );

    const job = await this.repository.create(
      this.factory.createJob(dto.projectId, dto.formats, dto.createdBy),
    );

    const startedAt = new Date();

    try {
      await this.repository.update(job.id, {
        status: ExportJobStatus.PROCESSING,
        startedAt,
      });

      const artifacts = await this.pipeline.execute(
        job.exportJobId,
        dto.formats,
        metadata,
        toc,
        contents,
      );

      const totalFileSize = artifacts.reduce(
        (total, artifact) => total + artifact.fileSize,
        0,
      );

      const completed = await this.repository.update(job.id, {
        status: ExportJobStatus.COMPLETED,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        generatedFiles: artifacts,
        totalFileSize,
        checksum: this.factory.checksum(artifacts.map((item) => item.checksum)),
        metadata: {
          coverPromptId: dto.coverPromptId,
          coverPromptVersion: coverPrompt.promptVersion,
        },
      });

      return this.mapper.toResponse(completed!);
    } catch (error) {
      await this.repository.update(job.id, {
        status: ExportJobStatus.FAILED,
        completedAt: new Date(),
        duration: Date.now() - startedAt.getTime(),
        errorMessage: error instanceof Error ? error.message : 'Export failed',
      });

      throw error;
    }
  }

  async findOne(id: string) {
    const job = await this.repository.findById(id);

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    return this.mapper.toResponse(job);
  }

  async findByProjectId(projectId: string) {
    const jobs = await this.repository.findByProjectId(projectId);

    return jobs.map((job) => this.mapper.toResponse(job));
  }

  async latestExport(projectId: string) {
    const job = await this.repository.latestExport(projectId);

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    return this.mapper.toResponse(job);
  }

  async search(query: ExportQueryDto) {
    const result = await this.repository.search(
      {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      query.page,
      query.limit,
    );

    return {
      ...result,
      items: result.items.map((item) => this.mapper.toResponse(item)),
    };
  }
}
