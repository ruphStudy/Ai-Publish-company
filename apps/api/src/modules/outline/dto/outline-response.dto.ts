import type {
  ChapterOutline,
  ChapterOutlineStatus,
} from '../entities/chapter-outline.entity';
import type { OutlineStatus } from '../entities/outline.entity';

export class ChapterOutlineResponseDto {
  chapterNumber: number;
  partNumber: number;
  partTitle: string;
  chapterTitle: string;
  objective: string;
  summary: string;
  estimatedWordCount: number;
  keyTopics: string[];
  learningOutcomes: string[];
  writingInstructions: string;
  references: string[];
  status: ChapterOutlineStatus;

  static fromEntity(chapter: ChapterOutline): ChapterOutlineResponseDto {
    return Object.assign(new ChapterOutlineResponseDto(), chapter);
  }
}

export class OutlineResponseDto {
  id: string;
  outlineId: string;
  blueprintId: string;
  projectId: string;
  title: string;
  subtitle?: string;
  totalParts: number;
  totalChapters: number;
  estimatedWordCount: number;
  estimatedReadingTime: number;
  outlineSummary: string;
  chapters: ChapterOutlineResponseDto[];
  confidenceScore: number;
  aiProvider: string;
  aiModel: string;
  promptVersion: string;
  outlineVersion: string;
  status: OutlineStatus;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}