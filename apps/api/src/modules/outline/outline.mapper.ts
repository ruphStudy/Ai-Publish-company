import { Injectable } from '@nestjs/common';
import { OutlineDocument } from './entities/outline.entity';
import {
  OutlineResponseDto} from './dto/outline-response.dto';
import {
  ChapterOutlineResponseDto
} from './dto/outline-response.dto';

@Injectable()
export class OutlineMapper {
  toResponse(document: OutlineDocument): OutlineResponseDto {
    return {
      id: document.id,
      outlineId: document.outlineId,
      blueprintId: document.blueprintId,
      projectId: document.projectId,
      title: document.title,
      subtitle: document.subtitle,
      totalParts: document.totalParts,
      totalChapters: document.totalChapters,
      estimatedWordCount: document.estimatedWordCount,
      estimatedReadingTime: document.estimatedReadingTime,
      outlineSummary: document.outlineSummary,
      chapters: document.chapters.map(ChapterOutlineResponseDto.fromEntity),
      confidenceScore: document.confidenceScore,
      aiProvider: document.aiProvider,
      aiModel: document.aiModel,
      promptVersion: document.promptVersion,
      outlineVersion: document.outlineVersion,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}