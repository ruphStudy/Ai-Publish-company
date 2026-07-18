import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { AIWritingRepository } from '../ai-writing/ai-writing.repository';
import { BookMetadataRepository } from '../book-metadata/book-metadata.repository';
import { BookProjectService } from '../book-project/book-project.service';
import { TableOfContentsRepository } from '../table-of-contents/table-of-contents.repository';
import type { CreateComplianceValidationDto, ComplianceValidationQueryDto } from './dto';
import { ComplianceLevel, ComplianceValidation, ComplianceValidationDocument, ComplianceValidationStatus, ComplianceValidationTargetType } from './entities/compliance-validation.entity';
import { ComplianceValidationEngine } from './compliance-validation.engine';
import { ComplianceValidationFactory } from './compliance-validation.factory';
import { ComplianceValidationMapper } from './compliance-validation.mapper';
import { ComplianceValidationRepository } from './compliance-validation.repository';
import { ComplianceValidationValidator } from './compliance-validation.validator';
import type { ComplianceContentSegment, ComplianceValidationInput } from './interfaces/compliance-validation.interface';

@Injectable()
export class ComplianceValidationService {
  constructor(private readonly projects: BookProjectService, private readonly contents: AIWritingRepository, private readonly metadata: BookMetadataRepository, private readonly toc: TableOfContentsRepository, private readonly repository: ComplianceValidationRepository, private readonly engine: ComplianceValidationEngine, private readonly factory: ComplianceValidationFactory, private readonly validator: ComplianceValidationValidator, private readonly mapper: ComplianceValidationMapper) {}
  async create(dto: CreateComplianceValidationDto) {
    await this.projects.findOne(dto.projectId); await this.loadTarget(dto);
    if (await this.repository.findIdentical(dto.targetType, dto.targetId, dto.manuscriptVersion)) throw new ConflictException('This target and manuscript version already has a compliance validation');
    const latest = await this.repository.latestValidation(dto.projectId);
    const item = await this.repository.create({ validationId: `PENDING-${Date.now()}`, ...dto, overallScore: 0, structuralScore: 0, metadataScore: 0, accessibilityScore: 0, seoScore: 0, exportReadinessScore: 0, publicationReadinessScore: 0, complianceLevel: ComplianceLevel.WARNING, blockingIssueCount: 0, warningCount: 0, recommendationCount: 0, passedChecks: [], failedChecks: [], warnings: [], recommendations: [], provider: 'pending', model: 'pending', tokenUsage: {}, estimatedCost: 0, processingTime: 0, requestMetadata: {}, status: ComplianceValidationStatus.PENDING, complianceVersion: (latest?.complianceVersion ?? 0) + 1, failureCode: null, failureMessage: null, isDeleted: false, createdBy: dto.createdBy ?? null, updatedBy: dto.createdBy ?? null });
    return this.mapper.toResponse(item);
  }
  async process(id: string) {
    const item = await this.document(id); this.validator.validateTransition(item.status, ComplianceValidationStatus.PROCESSING); const target = await this.loadTarget(item);
    await this.repository.update(id, { status: ComplianceValidationStatus.PROCESSING });
    try { const result = this.engine.analyze(target); const completed = this.factory.create({ projectId: item.projectId, targetType: item.targetType, targetId: item.targetId, manuscriptVersion: item.manuscriptVersion, scope: item.scope, complianceVersion: item.complianceVersion, createdBy: item.createdBy ?? undefined }, result); return this.mapper.toResponse((await this.repository.update(id, completed))!); }
    catch (error) { await this.repository.update(id, { status: ComplianceValidationStatus.FAILED, failureCode: 'COMPLIANCE_VALIDATION_FAILED', failureMessage: error instanceof Error ? error.message : 'Compliance validation failed' }); throw error; }
  }
  async approve(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, ComplianceValidationStatus.APPROVED); if (item.blockingIssueCount > 0) throw new BadRequestException('Blocking compliance issues prevent approval'); return this.mapper.toResponse((await this.repository.update(id, { status: ComplianceValidationStatus.APPROVED }))!); }
  async reject(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, ComplianceValidationStatus.REJECTED); return this.mapper.toResponse((await this.repository.update(id, { status: ComplianceValidationStatus.REJECTED }))!); }
  async findById(id: string) { return this.mapper.toResponse(await this.document(id)); }
  async findByProjectId(id: string) { return (await this.repository.findByProjectId(id)).map((item) => this.mapper.toResponse(item)); }
  async findByTarget(type: ComplianceValidationTargetType, id: string) { return (await this.repository.findByTarget(type, id)).map((item) => this.mapper.toResponse(item)); }
  async latestValidation(projectId: string) { const item = await this.repository.latestValidation(projectId); if (!item) throw new NotFoundException('Compliance validation not found'); return this.mapper.toResponse(item); }
  async search(query: ComplianceValidationQueryDto) { const filter: FilterQuery<ComplianceValidation> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.targetId) filter.targetId = query.targetId; if (query.status) filter.status = query.status; if (query.complianceLevel) filter.complianceLevel = query.complianceLevel; const result = await this.repository.paginate(filter, query.page, query.limit); return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) }; }
  async softDelete(id: string, userId?: string) { if (!(await this.repository.softDelete(id, userId))) throw new NotFoundException('Compliance validation not found'); }
  async restore(id: string) { const item = await this.repository.restore(id); if (!item) throw new NotFoundException('Deleted compliance validation not found'); return this.mapper.toResponse(item); }
  private async loadTarget(dto: Pick<CreateComplianceValidationDto, 'projectId' | 'targetType' | 'targetId' | 'manuscriptVersion'>): Promise<ComplianceValidationInput> {
    const metadata = await this.loadMetadata(dto.projectId); const toc = await this.loadToc(dto.projectId); const base = { metadata, toc, manuscriptVersion: dto.manuscriptVersion };
    if (dto.targetType === ComplianceValidationTargetType.MANUSCRIPT || dto.targetType === ComplianceValidationTargetType.BOOK) { const records = await this.contents.findByProjectId(dto.projectId); if (!records.length) throw new NotFoundException('Manuscript target not found'); const actualVersion = records.map((item) => item.contentVersion).join('+'); if (actualVersion !== dto.manuscriptVersion) throw new ConflictException('Manuscript version mismatch'); const markdownContent = records.map((item) => item.markdownContent).join('\n\n'); const htmlContent = records.map((item) => item.htmlContent).join('\n\n'); const plainTextContent = records.map((item) => item.plainTextContent).join('\n\n'); return { ...base, content: markdownContent, markdownContent, htmlContent, plainTextContent, segments: records.flatMap((item) => this.segments(item.markdownContent, `chapter:${item.chapterNumber}`, String(item.chapterNumber))) }; }
    const contentId = dto.targetType === ComplianceValidationTargetType.SECTION ? dto.targetId.split(':')[0] : dto.targetId; const record = await this.contents.findById(contentId); if (!record) throw new NotFoundException('Manuscript target not found'); this.validator.validateTarget(dto.projectId, record, dto.manuscriptVersion);
    if (dto.targetType === ComplianceValidationTargetType.SECTION) { const sectionNumber = dto.targetId.split(':')[1]; const section = record.chapterContent.sections.find((value) => value.sectionNumber === sectionNumber); if (!section) throw new NotFoundException('Section target not found'); return { ...base, content: section.content, markdownContent: section.content, htmlContent: section.content, plainTextContent: section.content, segments: this.segments(section.content, `section:${sectionNumber}`, String(record.chapterNumber), sectionNumber) }; }
    return { ...base, content: record.markdownContent, markdownContent: record.markdownContent, htmlContent: record.htmlContent, plainTextContent: record.plainTextContent, segments: this.segments(record.markdownContent, `chapter:${record.chapterNumber}`, String(record.chapterNumber)) };
  }
  private async loadMetadata(projectId: string): Promise<Record<string, unknown>> { const records = await this.metadata.findByProjectId(projectId); return (records[0]?.toObject() as unknown as Record<string, unknown>) ?? {}; }
  private async loadToc(projectId: string): Promise<Record<string, unknown> | null> { const records = await this.toc.findByProjectId(projectId); return (records[0]?.toObject() as unknown as Record<string, unknown>) ?? null; }
  private segments(content: string, prefix: string, chapterId?: string, sectionId?: string): ComplianceContentSegment[] { return content.split(/\n\s*\n/).map((text, index) => ({ location: `${prefix}:paragraph:${index + 1}`, text: text.trim(), chapterId, sectionId })).filter((item) => item.text.length > 0); }
  private async document(id: string): Promise<ComplianceValidationDocument> { const item = await this.repository.findById(id); if (!item) throw new NotFoundException('Compliance validation not found'); return item; }
}
