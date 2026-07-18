import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Types } from 'mongoose';
import { BookBlueprint } from '../book-blueprint/entities/book-blueprint.entity';
import { BookMetadata } from '../book-metadata/entities/book-metadata.entity';
import { BookProject } from '../book-project/entities/book-project.entity';
import { CoverPrompt } from '../cover-prompt/entities/cover-prompt.entity';
import { ExportJob } from '../export/entities/export-job.entity';
import { MarketIntelligence, MarketIntelligenceStatus } from '../market-intelligence/entities/market-intelligence.entity';
import { MarketKnowledge } from '../market-intelligence/knowledge-database/entities/market-knowledge.entity';
import { Outline } from '../outline/entities/outline.entity';
import { TableOfContents } from '../table-of-contents/entities/table-of-contents.entity';

type Artifact = { id: string; title?: string; status?: string; updatedAt?: Date | string };
type WorkflowReadiness = 'BLOCKED' | 'READY' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
type WorkflowStage = { key: string; readiness: WorkflowReadiness; available: Artifact[]; selected?: Artifact | null; missingPrerequisites: string[]; allowedActions: string[]; blockingReason?: string; nextRecommendedAction?: string };

@Injectable()
export class WorkflowContextService {
  constructor(
    @InjectModel(BookProject.name) private readonly projects: Model<BookProject>,
    @InjectModel(MarketIntelligence.name) private readonly marketIntelligence: Model<MarketIntelligence>,
    @InjectModel(MarketKnowledge.name) private readonly knowledge: Model<MarketKnowledge>,
    @InjectModel(BookBlueprint.name) private readonly blueprints: Model<BookBlueprint>,
    @InjectModel(Outline.name) private readonly outlines: Model<Outline>,
    @InjectModel(BookMetadata.name) private readonly metadata: Model<BookMetadata>,
    @InjectModel(TableOfContents.name) private readonly toc: Model<TableOfContents>,
    @InjectModel(CoverPrompt.name) private readonly coverPrompts: Model<CoverPrompt>,
    @InjectModel(ExportJob.name) private readonly exports: Model<ExportJob>,
  ) {}

  async projectContext(projectId: string) {
    const objectProjectId = Types.ObjectId.isValid(projectId) ? new Types.ObjectId(projectId) : projectId;
    const [project, market, knowledge, blueprints, outlines, metadata, toc, coverPrompts, exports] = await Promise.all([
      this.projects.findById(projectId).lean().exec(),
      this.marketIntelligence.find({ status: MarketIntelligenceStatus.ACTIVE }).sort({ updatedAt: -1 }).limit(20).lean().exec(),
      this.knowledge.find({}).sort({ updatedAt: -1 }).limit(20).lean().exec(),
      this.blueprints.find({ projectId: objectProjectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
      this.outlines.find({ projectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
      this.metadata.find({ projectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
      this.toc.find({ projectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
      this.coverPrompts.find({ projectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
      this.exports.find({ projectId }).sort({ updatedAt: -1 }).limit(10).lean().exec(),
    ]);
    const marketArtifacts = market.map((item) => this.marketArtifact(item));
    const knowledgeArtifacts = knowledge.map((item) => this.knowledgeArtifact(item));
    const blueprintArtifacts = blueprints.map((item) => this.artifact(item, item.title, item.status));
    const outlineArtifacts = outlines.map((item) => this.artifact(item, item.title, item.status));
    const metadataArtifacts = metadata.map((item) => this.artifact(item, item.title, item.status));
    const tocArtifacts = toc.map((item) => this.artifact(item, item.title, item.status));
    const coverArtifacts = coverPrompts.map((item) => this.artifact(item, item.title, item.status));
    const exportArtifacts = exports.map((item) => this.artifact(item, item.exportJobId, item.status));
    const latestBlueprint = blueprints[0] ?? null;
    const latestOutline = outlines[0] ?? null;
    const blueprint = blueprintArtifacts[0] ?? null;
    const outline = outlineArtifacts[0] ?? null;
    const meta = metadataArtifacts[0] ?? null;
    const tocArtifact = tocArtifacts[0] ?? null;
    const cover = coverArtifacts[0] ?? null;
    return {
      project: project ? this.artifact(project, project.title, project.status) : null,
      artifacts: { marketIntelligence: marketArtifacts, knowledge: knowledgeArtifacts, blueprints: blueprintArtifacts, outlines: outlineArtifacts, metadata: metadataArtifacts, tableOfContents: tocArtifacts, coverPrompts: coverArtifacts, exports: exportArtifacts },
      stages: {
        generation: this.generationStage([marketArtifacts.length ? '' : 'Market Intelligence', knowledgeArtifacts.length ? '' : 'Knowledge record'].filter(Boolean), blueprintArtifacts, blueprint, latestBlueprint),
        outline: this.outlineStage([blueprint ? '' : 'Blueprint'].filter(Boolean), outlineArtifacts, outline, latestOutline),
        production: this.stage('production', [outline ? '' : 'Generated outline/content'].filter(Boolean), [], null, ['startProductionChecks']),
        publishing: this.stage('publishing', [meta ? '' : 'Metadata', tocArtifact ? '' : 'Table of contents', cover ? '' : 'Cover prompt'].filter(Boolean), [], null, ['reviewPublishingPayload']),
        export: this.stage('export', [blueprint ? '' : 'Blueprint', meta ? '' : 'Metadata', tocArtifact ? '' : 'Table of contents', cover ? '' : 'Cover prompt'].filter(Boolean), exportArtifacts, exportArtifacts[0] ?? null, ['createExport']),
      },
    };
  }

  async listMarketIntelligence(search?: string) {
    const records = await this.marketIntelligence.find({ ...(search ? { $text: { $search: search } } : {}), status: MarketIntelligenceStatus.ACTIVE }).sort({ updatedAt: -1 }).limit(50).lean().exec();
    return records.map((item) => this.marketArtifact(item));
  }

  async listKnowledge(search?: string) {
    const records = await this.knowledge.find(search ? { $text: { $search: search } } : {}).sort({ updatedAt: -1 }).limit(50).lean().exec();
    return records.map((item) => this.knowledgeArtifact(item));
  }

  private stage(key: string, missingPrerequisites: string[], available: Artifact[], selected: Artifact | null, allowedActions: string[]): WorkflowStage {
    return { key, readiness: missingPrerequisites.length ? 'BLOCKED' : selected ? 'COMPLETED' : 'READY', available, selected, missingPrerequisites, allowedActions: missingPrerequisites.length ? [] : allowedActions, blockingReason: missingPrerequisites.length ? `Missing ${missingPrerequisites.join(', ')}` : undefined, nextRecommendedAction: missingPrerequisites[0] ? `Create or select ${missingPrerequisites[0]}` : allowedActions[0] };
  }

  private generationStage(missingPrerequisites: string[], available: Artifact[], selected: Artifact | null, blueprint: Record<string, unknown> | null): WorkflowStage {
    if (missingPrerequisites.length) {
      return this.stage('generation', missingPrerequisites, available, selected, ['generateBlueprint']);
    }

    const complete = Boolean(
      blueprint?.title &&
      blueprint?.objective &&
      blueprint?.usp &&
      blueprint?.targetAudience &&
      blueprint?.estimatedWordCount &&
      blueprint?.estimatedChapterCount,
    );

    return {
      key: 'generation',
      readiness: selected ? complete ? 'COMPLETED' : 'FAILED' : 'READY',
      available,
      selected,
      missingPrerequisites: complete || !selected ? [] : ['Complete blueprint content'],
      allowedActions: ['generateBlueprint'],
      blockingReason: complete || !selected ? undefined : 'Latest blueprint is missing required generated content',
      nextRecommendedAction: selected ? 'reviewBlueprint' : 'generateBlueprint',
    };
  }

  private outlineStage(missingPrerequisites: string[], available: Artifact[], selected: Artifact | null, outline: Record<string, unknown> | null): WorkflowStage {
    if (missingPrerequisites.length) {
      return this.stage('outline', missingPrerequisites, available, selected, ['generateOutline']);
    }

    const chapters = Array.isArray(outline?.chapters) ? outline.chapters : [];
    const complete = Boolean(outline?.title && outline?.outlineSummary && chapters.length);

    return {
      key: 'outline',
      readiness: selected ? complete ? 'COMPLETED' : 'FAILED' : 'READY',
      available,
      selected,
      missingPrerequisites: complete || !selected ? [] : ['Complete outline content'],
      allowedActions: ['generateOutline'],
      blockingReason: complete || !selected ? undefined : 'Latest outline is missing required generated content',
      nextRecommendedAction: selected ? 'reviewOutline' : 'generateOutline',
    };
  }

  private artifact(item: Record<string, unknown>, title?: unknown, status?: unknown): Artifact {
    return { id: String(item.id ?? item._id), title: title ? String(title) : undefined, status: status ? String(status) : undefined, updatedAt: item.updatedAt as Date | string | undefined };
  }

  private marketArtifact(item: Record<string, unknown>): Artifact {
    const title = this.cleanTitle(item.title, [
      item.genre,
      item.market,
      item.dataType ? this.label(String(item.dataType)) : undefined,
      Array.isArray(item.keywords) ? item.keywords.slice(0, 2).join(', ') : undefined,
    ], 'Market Intelligence');
    return this.artifact(item, title, item.status);
  }

  private knowledgeArtifact(item: Record<string, unknown>): Artifact {
    const title = this.cleanTitle(item.title, [
      item.category,
      item.author,
      item.provider ? this.label(String(item.provider)) : undefined,
      Array.isArray(item.keywords) ? item.keywords.slice(0, 2).join(', ') : undefined,
    ], 'Knowledge Record');
    return this.artifact(item, title, undefined);
  }

  private cleanTitle(value: unknown, fallbacks: unknown[], fallbackLabel: string) {
    const raw = typeof value === 'string' ? value.trim() : '';
    const looksInternal = /runtime|validation|test|fixture|mock|sample|temporary/i.test(raw);
    if (raw && !looksInternal) return raw;
    const parts = fallbacks.map((item) => typeof item === 'string' ? item.trim() : '').filter(Boolean);
    return parts.length ? `${fallbackLabel}: ${parts.join(' • ')}` : fallbackLabel;
  }

  private label(value: string) {
    return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
