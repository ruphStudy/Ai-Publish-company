import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { AIWritingRepository } from '../ai-writing/ai-writing.repository';
import { BookProjectService } from '../book-project/book-project.service';
import type { CreateFactConsistencyDto, FactConsistencyQueryDto } from './dto';
import { ExternalVerificationBoundary, FactConsistency, FactConsistencyDocument, FactConsistencyStatus, FactConsistencyTargetType, FactPublicationRecommendation, FactRiskLevel } from './entities/fact-consistency.entity';
import { FactConsistencyEngine } from './fact-consistency.engine';
import { FactConsistencyFactory } from './fact-consistency.factory';
import { FactConsistencyMapper } from './fact-consistency.mapper';
import { FactConsistencyRepository } from './fact-consistency.repository';
import { FactConsistencyValidator } from './fact-consistency.validator';
import type { FactContentSegment } from './interfaces/fact-consistency.interface';

@Injectable()
export class FactConsistencyService {
  constructor(private readonly projects: BookProjectService, private readonly contents: AIWritingRepository, private readonly repository: FactConsistencyRepository, private readonly engine: FactConsistencyEngine, private readonly factory: FactConsistencyFactory, private readonly validator: FactConsistencyValidator, private readonly mapper: FactConsistencyMapper) {}
  async create(dto: CreateFactConsistencyDto) {
    await this.projects.findOne(dto.projectId); await this.loadTarget(dto);
    if (await this.repository.findIdentical(dto.targetType, dto.targetId, dto.manuscriptVersion)) throw new ConflictException('This target and manuscript version already has a validation');
    const latest = await this.repository.latestValidation(dto.projectId);
    const item = await this.repository.create({ validationId: `PENDING-${Date.now()}`, ...dto, overallScore: 0, internalConsistencyScore: 0, claimSupportScore: 0, citationCoverageScore: 0, timelineConsistencyScore: 0, numericConsistencyScore: 0, entityConsistencyScore: 0, factRiskScore: 0, riskLevel: FactRiskLevel.NONE, publicationRecommendation: FactPublicationRecommendation.REVIEW, externalVerificationBoundary: ExternalVerificationBoundary.INTERNAL_CONSISTENCY_VALIDATION, extractedClaims: [], contradictions: [], unsupportedClaims: [], citationIssues: [], timelineIssues: [], numericIssues: [], entityIssues: [], terminologyIssues: [], recommendations: [], provider: 'pending', model: 'pending', tokenUsage: {}, estimatedCost: 0, processingTime: 0, requestMetadata: {}, status: FactConsistencyStatus.PENDING, validationVersion: (latest?.validationVersion ?? 0) + 1, failureCode: null, failureMessage: null, isDeleted: false, createdBy: dto.createdBy ?? null, updatedBy: dto.createdBy ?? null });
    return this.mapper.toResponse(item);
  }
  async process(id: string) {
    const item = await this.document(id); this.validator.validateTransition(item.status, FactConsistencyStatus.PROCESSING); const target = await this.loadTarget(item);
    await this.repository.update(id, { status: FactConsistencyStatus.PROCESSING });
    try { const result = await this.engine.analyze(target); const completed = this.factory.create({ projectId: item.projectId, targetType: item.targetType, targetId: item.targetId, manuscriptVersion: item.manuscriptVersion, scope: item.scope, validationVersion: item.validationVersion, createdBy: item.createdBy ?? undefined }, result); return this.mapper.toResponse((await this.repository.update(id, completed))!); }
    catch (error) { await this.repository.update(id, { status: FactConsistencyStatus.FAILED, failureCode: 'FACT_VALIDATION_FAILED', failureMessage: error instanceof Error ? error.message : 'Fact consistency validation failed' }); throw error; }
  }
  async approve(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, FactConsistencyStatus.APPROVED); if (item.contradictions.some((issue) => issue.blockingPublication && issue.severity === 'CRITICAL')) throw new BadRequestException('Critical contradictions block approval'); return this.mapper.toResponse((await this.repository.update(id, { status: FactConsistencyStatus.APPROVED }))!); }
  async reject(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, FactConsistencyStatus.REJECTED); return this.mapper.toResponse((await this.repository.update(id, { status: FactConsistencyStatus.REJECTED }))!); }
  async findById(id: string) { return this.mapper.toResponse(await this.document(id)); }
  async findByProjectId(id: string) { return (await this.repository.findByProjectId(id)).map((item) => this.mapper.toResponse(item)); }
  async findByTarget(type: FactConsistencyTargetType, id: string) { return (await this.repository.findByTarget(type, id)).map((item) => this.mapper.toResponse(item)); }
  async latestValidation(projectId: string) { const item = await this.repository.latestValidation(projectId); if (!item) throw new NotFoundException('Fact consistency validation not found'); return this.mapper.toResponse(item); }
  async search(query: FactConsistencyQueryDto) { const filter: FilterQuery<FactConsistency> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.targetId) filter.targetId = query.targetId; if (query.status) filter.status = query.status; if (query.riskLevel) filter.riskLevel = query.riskLevel; const result = await this.repository.paginate(filter, query.page, query.limit); return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) }; }
  async softDelete(id: string, userId?: string) { if (!(await this.repository.softDelete(id, userId))) throw new NotFoundException('Fact consistency validation not found'); }
  async restore(id: string) { const item = await this.repository.restore(id); if (!item) throw new NotFoundException('Deleted fact consistency validation not found'); return this.mapper.toResponse(item); }
  private async loadTarget(dto: Pick<CreateFactConsistencyDto, 'projectId' | 'targetType' | 'targetId' | 'manuscriptVersion'>): Promise<{ content: string; segments: FactContentSegment[] }> {
    if (dto.targetType === FactConsistencyTargetType.MANUSCRIPT) { const records = await this.contents.findByProjectId(dto.projectId); if (!records.length) throw new NotFoundException('Manuscript target not found'); const actualVersion = records.map((item) => item.contentVersion).join('+'); if (actualVersion !== dto.manuscriptVersion) throw new ConflictException('Manuscript version mismatch'); const segments = records.flatMap((item) => this.segments(item.markdownContent, `chapter:${item.chapterNumber}`, String(item.chapterNumber))); return { content: records.map((item) => item.markdownContent).join('\n\n'), segments }; }
    const contentId = dto.targetType === FactConsistencyTargetType.SECTION ? dto.targetId.split(':')[0] : dto.targetId; const record = await this.contents.findById(contentId); if (!record) throw new NotFoundException('Manuscript target not found'); this.validator.validateTarget(dto.projectId, record, dto.manuscriptVersion);
    if (dto.targetType === FactConsistencyTargetType.SECTION) { const sectionNumber = dto.targetId.split(':')[1]; const section = record.chapterContent.sections.find((value) => value.sectionNumber === sectionNumber); if (!section) throw new NotFoundException('Section target not found'); return { content: section.content, segments: this.segments(section.content, `section:${sectionNumber}`, String(record.chapterNumber), sectionNumber) }; }
    return { content: record.markdownContent, segments: this.segments(record.markdownContent, `chapter:${record.chapterNumber}`, String(record.chapterNumber)) };
  }
  private segments(content: string, prefix: string, chapterId?: string, sectionId?: string): FactContentSegment[] { return content.split(/\n\s*\n/).map((text, index) => ({ location: `${prefix}:paragraph:${index + 1}`, text: text.trim(), chapterId, sectionId })).filter((item) => item.text.length > 0); }
  private async document(id: string): Promise<FactConsistencyDocument> { const item = await this.repository.findById(id); if (!item) throw new NotFoundException('Fact consistency validation not found'); return item; }
}
