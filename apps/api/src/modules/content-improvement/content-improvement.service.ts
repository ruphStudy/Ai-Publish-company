import { randomUUID } from 'crypto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AIWritingRepository } from '../ai-writing/ai-writing.repository';
import { ContentGenerationStatus } from '../ai-writing/entities/book-content.entity';
import { BookProjectService } from '../book-project/book-project.service';
import { QualityReviewRepository } from '../quality-review/quality-review.repository';
import { QualityIssueSeverity, QualityReviewStatus } from '../quality-review/entities/quality-review.entity';
import { ContentImprovementQueryDto, CreateContentImprovementDto } from './dto';
import { ContentImprovement, ContentImprovementDocument, ContentImprovementStatus, ImprovementScope, ImprovementTargetType } from './entities/content-improvement.entity';
import { ContentImprovementEngine } from './content-improvement.engine';
import { ContentImprovementMapper } from './content-improvement.mapper';
import { ContentImprovementRepository } from './content-improvement.repository';
import { ContentImprovementValidator } from './content-improvement.validator';

@Injectable()
export class ContentImprovementService {
  constructor(private readonly projects: BookProjectService, private readonly reviews: QualityReviewRepository, private readonly contents: AIWritingRepository, private readonly repository: ContentImprovementRepository, private readonly engine: ContentImprovementEngine, private readonly validator: ContentImprovementValidator, private readonly mapper: ContentImprovementMapper) {}

  async create(dto: CreateContentImprovementDto) {
    await this.projects.findOne(dto.projectId);
    const review = dto.qualityReviewId ? await this.reviews.findById(dto.qualityReviewId) : await this.latestCompletedReview(dto.projectId);
    if (!review) throw new NotFoundException('Completed quality review not found');
    this.validator.validateReview(review);
    if (review.projectId !== dto.projectId) throw new BadRequestException('Quality review does not belong to the project');
    const targets = await this.loadTargets(dto);
    const originalContent = this.extractContent(dto, targets);
    const latest = await this.repository.findLatestByTarget(dto.targetType, dto.targetId);
    const item = await this.repository.create({ improvementId: `CIM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 8).toUpperCase()}`, projectId: dto.projectId, qualityReviewId: review.id, targetType: dto.targetType, targetId: dto.targetId, scope: dto.scope, mode: dto.mode, minimumSeverity: dto.minimumSeverity, originalContent, improvedContent: '', originalWordCount: this.words(originalContent), improvedWordCount: 0, wordCountDifference: 0, appliedIssueIds: [], unresolvedIssueIds: [], improvementSummary: '', improvementMetrics: this.emptyMetrics(), aiProvider: 'pending', aiModel: 'pending', tokenUsage: {}, estimatedCost: 0, latencyMs: 0, requestMetadata: { instruction: dto.instruction }, status: ContentImprovementStatus.PENDING, improvementVersion: (latest?.improvementVersion ?? 0) + 1, failureCode: null, failureMessage: null, appliedContentVersionIds: [], createdBy: dto.createdBy ?? null, updatedBy: dto.createdBy ?? null });
    return this.mapper.toResponse(item);
  }

  async process(id: string) {
    const item = await this.document(id);
    this.validator.validateTransition(item.status, ContentImprovementStatus.PROCESSING);
    await this.repository.update(id, { status: ContentImprovementStatus.PROCESSING, failureCode: null, failureMessage: null });
    try {
      const review = await this.reviews.findById(item.qualityReviewId);
      if (!review) throw new NotFoundException('Quality review not found');
      const issueIds = review.issues.map((_, index) => `${review.reviewId}:${index}`).filter((_, index) => this.severityAtLeast(review.issues[index].severity, item.minimumSeverity));
      const result = await this.engine.improve({ content: item.originalContent, scope: item.scope, mode: item.mode, issueIds, instruction: typeof item.requestMetadata.instruction === 'string' ? item.requestMetadata.instruction : undefined });
      const improvedWordCount = this.words(result.improvedContent);
      const updated = await this.repository.update(id, { improvedContent: result.improvedContent, improvedWordCount, wordCountDifference: improvedWordCount - item.originalWordCount, appliedIssueIds: result.appliedIssueIds, unresolvedIssueIds: result.unresolvedIssueIds, improvementSummary: result.summary, improvementMetrics: result.metrics, aiProvider: result.provider, aiModel: result.model, tokenUsage: result.tokenUsage, estimatedCost: result.estimatedCost, latencyMs: result.latencyMs, requestMetadata: { ...item.requestMetadata, ...result.requestMetadata }, status: ContentImprovementStatus.COMPLETED });
      return this.mapper.toResponse(updated!);
    } catch (error) {
      await this.repository.update(id, { status: ContentImprovementStatus.FAILED, failureCode: error instanceof BadRequestException ? 'INVALID_PROVIDER_OUTPUT' : 'IMPROVEMENT_FAILED', failureMessage: error instanceof Error ? error.message : 'Content improvement failed' });
      throw error;
    }
  }

  async approve(id: string) { const item = await this.document(id); this.validator.validateApproval(item); return this.mapper.toResponse((await this.repository.update(id, { status: ContentImprovementStatus.APPROVED }))!); }
  async reject(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, ContentImprovementStatus.REJECTED); return this.mapper.toResponse((await this.repository.update(id, { status: ContentImprovementStatus.REJECTED }))!); }

  async apply(id: string) {
    const item = await this.document(id);
    const review = await this.reviews.findById(item.qualityReviewId);
    if (!review) throw new NotFoundException('Quality review not found');
    this.validator.validateApplication(item, review);
    if (item.scope === ImprovementScope.MANUSCRIPT) throw new BadRequestException('Manuscript improvements must be applied chapter by chapter');
    const sourceId = item.targetType === ImprovementTargetType.SECTION ? item.targetId.split(':')[0] : item.targetId;
    const source = await this.contents.findById(sourceId);
    if (!source) throw new NotFoundException('Target content not found');
    const created = await this.contents.create({ contentId: `CNT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${source.chapterNumber}-${randomUUID().slice(0, 8).toUpperCase()}`, projectId: source.projectId, blueprintId: source.blueprintId, outlineId: source.outlineId, chapterId: source.chapterId, chapterNumber: source.chapterNumber, chapterTitle: source.chapterTitle, chapterContent: source.chapterContent, generatedContent: item.improvedContent, markdownContent: item.improvedContent, plainTextContent: this.plainText(item.improvedContent), htmlContent: this.html(item.improvedContent), estimatedReadingTime: Math.max(1, Math.ceil(item.improvedWordCount / 220)), generatedWordCount: item.improvedWordCount, tokenUsage: item.tokenUsage, promptTokens: item.tokenUsage.promptTokens ?? 0, completionTokens: item.tokenUsage.completionTokens ?? 0, estimatedCost: item.estimatedCost, aiProvider: item.aiProvider, aiModel: item.aiModel, generationTime: item.latencyMs, promptVersion: source.promptVersion, contentVersion: `v${Number(source.contentVersion.replace(/^v/, '')) + 1}`, confidenceScore: source.confidenceScore, status: ContentGenerationStatus.REVIEW_REQUIRED, metadata: { ...source.metadata, improvementId: item.id, sourceContentId: source.id }, createdBy: item.updatedBy ?? item.createdBy ?? undefined, updatedBy: item.updatedBy ?? item.createdBy ?? undefined });
    const updated = await this.repository.update(id, { status: ContentImprovementStatus.APPLIED, appliedContentVersionIds: [created.id] });
    return this.mapper.toResponse(updated!);
  }

  async findById(id: string) { return this.mapper.toResponse(await this.document(id)); }
  async findByProjectId(projectId: string) { return (await this.repository.findByProjectId(projectId)).map((item) => this.mapper.toResponse(item)); }
  async findByTarget(type: ImprovementTargetType, id: string) { return (await this.repository.findByTarget(type, id)).map((item) => this.mapper.toResponse(item)); }
  async search(query: ContentImprovementQueryDto) { const filter: FilterQuery<ContentImprovement> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.targetId) filter.targetId = query.targetId; if (query.status) filter.status = query.status; const result = await this.repository.paginate(filter, query.page, query.limit); return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) }; }
  async softDelete(id: string, userId?: string) { if (!(await this.repository.softDelete(id, userId))) throw new NotFoundException('Content improvement not found'); }
  async restore(id: string) { const item = await this.repository.restore(id); if (!item) throw new NotFoundException('Deleted content improvement not found'); return this.mapper.toResponse(item); }

  private async latestCompletedReview(projectId: string) { const records = await this.reviews.findByProjectId(projectId); return records.find((item) => item.status === QualityReviewStatus.COMPLETED || item.status === QualityReviewStatus.APPROVED) ?? null; }
  private async loadTargets(dto: CreateContentImprovementDto) { if (dto.scope === ImprovementScope.MANUSCRIPT) { const records = await this.contents.findByProjectId(dto.projectId); if (!records.length) throw new NotFoundException('Target content not found'); return records; } const id = dto.targetType === ImprovementTargetType.SECTION ? dto.targetId.split(':')[0] : dto.targetId; const target = await this.contents.findById(id); if (!target) throw new NotFoundException('Target content not found'); this.validator.validateTarget(dto.projectId, target); return [target]; }
  private extractContent(dto: CreateContentImprovementDto, targets: Awaited<ReturnType<AIWritingRepository['findByProjectId']>>) { if (dto.targetType === ImprovementTargetType.SECTION) { const sectionNumber = dto.targetId.split(':')[1]; const section = targets[0].chapterContent.sections.find((value) => value.sectionNumber === sectionNumber); if (!section) throw new NotFoundException('Target section not found'); return [section.title, section.content].filter(Boolean).join('\n\n'); } return targets.map((item) => item.markdownContent).join('\n\n'); }
  private async document(id: string): Promise<ContentImprovementDocument> { const item = await this.repository.findById(id); if (!item) throw new NotFoundException('Content improvement not found'); return item; }
  private words(value: string) { return value.trim() ? value.trim().split(/\s+/).length : 0; }
  private severityAtLeast(value: QualityIssueSeverity, minimum: QualityIssueSeverity) { const order = Object.values(QualityIssueSeverity); return order.indexOf(value) >= order.indexOf(minimum); }
  private emptyMetrics() { return { grammarImprovement: 0, readabilityImprovement: 0, clarityImprovement: 0, repetitionReduction: 0, consistencyImprovement: 0, overallEstimatedImprovement: 0, issuesAddressedCount: 0, unresolvedIssuesCount: 0 }; }
  private plainText(value: string) { return value.replace(/#{1,6}\s/g, '').replace(/[*_~`]/g, '').trim(); }
  private html(value: string) { return value.split('\n').filter(Boolean).map((line) => line.startsWith('# ') ? `<h1>${line.slice(2)}</h1>` : `<p>${line}</p>`).join('\n'); }
}
