import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { AIWritingRepository } from '../ai-writing/ai-writing.repository';
import { BookProjectService } from '../book-project/book-project.service';
import { CreatePlagiarismDetectionDto, PlagiarismDetectionQueryDto } from './dto';
import { PlagiarismDetection, PlagiarismDetectionDocument, PlagiarismDetectionStatus, PlagiarismRiskLevel, PlagiarismTargetType, PublicationRecommendation } from './entities/plagiarism-detection.entity';
import { DetectionSegment } from './interfaces/plagiarism-strategy.interface';
import { PlagiarismDetectionEngine } from './plagiarism-detection.engine';
import { PlagiarismDetectionFactory } from './plagiarism-detection.factory';
import { PlagiarismDetectionMapper } from './plagiarism-detection.mapper';
import { PlagiarismDetectionRepository } from './plagiarism-detection.repository';
import { PlagiarismDetectionValidator } from './plagiarism-detection.validator';

@Injectable()
export class PlagiarismDetectionService {
  constructor(private readonly projects: BookProjectService, private readonly contents: AIWritingRepository, private readonly repository: PlagiarismDetectionRepository, private readonly engine: PlagiarismDetectionEngine, private readonly factory: PlagiarismDetectionFactory, private readonly validator: PlagiarismDetectionValidator, private readonly mapper: PlagiarismDetectionMapper) {}
  async create(dto: CreatePlagiarismDetectionDto) {
    await this.projects.findOne(dto.projectId);
    if (await this.repository.findIdentical(dto.targetType, dto.targetId, dto.manuscriptVersion)) throw new ConflictException('This manuscript version has already been processed');
    const target = await this.loadTarget(dto);
    const latest = await this.repository.latestDetection(dto.projectId);
    const pending = await this.repository.create({ detectionId: `PENDING-${Date.now()}`, projectId: dto.projectId, targetType: dto.targetType, targetId: dto.targetId, scope: dto.scope, manuscriptVersion: dto.manuscriptVersion, originalityScore: 0, similarityScore: 0, duplicateScore: 0, copyrightRiskScore: 0, aiRepetitionScore: 0, riskLevel: PlagiarismRiskLevel.NONE, publicationRecommendation: PublicationRecommendation.REVIEW, findings: [], matchedSections: [], duplicateLocations: [], recommendations: [], provider: 'pending', model: 'pending', tokenUsage: {}, estimatedCost: 0, processingTime: 0, status: PlagiarismDetectionStatus.PENDING, detectionVersion: (latest?.detectionVersion ?? 0) + 1, failureCode: null, failureMessage: null, metadata: {}, createdBy: dto.createdBy ?? null, updatedBy: dto.createdBy ?? null });
    await this.repository.update(pending.id, { status: PlagiarismDetectionStatus.PROCESSING });
    try { const result = await this.engine.detect({ content: target.content, segments: target.segments }); const completed = this.factory.create({ ...dto, detectionVersion: pending.detectionVersion }, result); const updated = await this.repository.update(pending.id, completed); return this.mapper.toResponse(updated!); } catch (error) { await this.repository.update(pending.id, { status: PlagiarismDetectionStatus.FAILED, failureCode: 'DETECTION_FAILED', failureMessage: error instanceof Error ? error.message : 'Plagiarism detection failed' }); throw error; }
  }
  async approve(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, PlagiarismDetectionStatus.APPROVED); return this.mapper.toResponse((await this.repository.update(id, { status: PlagiarismDetectionStatus.APPROVED }))!); }
  async reject(id: string) { const item = await this.document(id); this.validator.validateTransition(item.status, PlagiarismDetectionStatus.REJECTED); return this.mapper.toResponse((await this.repository.update(id, { status: PlagiarismDetectionStatus.REJECTED }))!); }
  async findById(id: string) { return this.mapper.toResponse(await this.document(id)); }
  async findByProjectId(projectId: string) { return (await this.repository.findByProjectId(projectId)).map((item) => this.mapper.toResponse(item)); }
  async findByTarget(type: PlagiarismTargetType, id: string) { return (await this.repository.findByTarget(type, id)).map((item) => this.mapper.toResponse(item)); }
  async latestDetection(projectId: string) { const item = await this.repository.latestDetection(projectId); if (!item) throw new NotFoundException('Plagiarism detection not found'); return this.mapper.toResponse(item); }
  async search(query: PlagiarismDetectionQueryDto) { const filter: FilterQuery<PlagiarismDetection> = {}; if (query.projectId) filter.projectId = query.projectId; if (query.targetId) filter.targetId = query.targetId; if (query.status) filter.status = query.status; const result = await this.repository.paginate(filter, query.page, query.limit); return { ...result, items: result.items.map((item) => this.mapper.toResponse(item)) }; }
  async softDelete(id: string, userId?: string) { if (!(await this.repository.softDelete(id, userId))) throw new NotFoundException('Plagiarism detection not found'); }
  async restore(id: string) { const item = await this.repository.restore(id); if (!item) throw new NotFoundException('Deleted plagiarism detection not found'); return this.mapper.toResponse(item); }
  private async loadTarget(dto: CreatePlagiarismDetectionDto): Promise<{ content: string; segments: DetectionSegment[] }> {
    if (dto.targetType === PlagiarismTargetType.MANUSCRIPT) { const records = await this.contents.findByProjectId(dto.projectId); if (!records.length) throw new NotFoundException('Manuscript target not found'); const actualVersion = records.map((item) => item.contentVersion).join('+'); if (actualVersion !== dto.manuscriptVersion) throw new ConflictException('Manuscript version mismatch'); const segments = records.flatMap((item) => this.segments(item.markdownContent, `chapter:${item.chapterNumber}`)); return { content: records.map((item) => item.markdownContent).join('\n\n'), segments }; }
    const contentId = dto.targetType === PlagiarismTargetType.SECTION ? dto.targetId.split(':')[0] : dto.targetId; const record = await this.contents.findById(contentId); if (!record) throw new NotFoundException('Manuscript target not found'); this.validator.validateTarget(dto.projectId, record, dto.manuscriptVersion);
    if (dto.targetType === PlagiarismTargetType.SECTION) { const sectionNumber = dto.targetId.split(':')[1]; const section = record.chapterContent.sections.find((item) => item.sectionNumber === sectionNumber); if (!section) throw new NotFoundException('Section target not found'); return { content: section.content, segments: this.segments(section.content, `section:${sectionNumber}`) }; }
    return { content: record.markdownContent, segments: this.segments(record.markdownContent, `chapter:${record.chapterNumber}`) };
  }
  private segments(content: string, prefix: string): DetectionSegment[] { return content.split(/\n\s*\n/).map((text, index) => ({ location: `${prefix}:paragraph:${index + 1}`, text: text.trim() })).filter((item) => item.text.length >= 20); }
  private async document(id: string): Promise<PlagiarismDetectionDocument> { const item = await this.repository.findById(id); if (!item) throw new NotFoundException('Plagiarism detection not found'); return item; }
}
