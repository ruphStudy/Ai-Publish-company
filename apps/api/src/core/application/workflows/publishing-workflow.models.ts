import type { ExportFormat } from '../../../modules/export/entities/export-artifact.entity';

export interface OutlineGenerationCommand { blueprintId: string; generatedBy?: string }
export interface ChapterGenerationCommand { blueprintId: string; outlineId: string; chapterNumber: number; generatedBy?: string }
export interface ContentGenerationCommand { blueprintId: string; outlineId: string; chapterId: string; generatedBy?: string }
export interface MetadataGenerationCommand { projectId: string; blueprintId: string; generatedBy?: string }
export interface CoverPromptGenerationCommand { projectId: string; blueprintId: string; metadataId: string; generatedBy?: string }
export interface TableOfContentsGenerationCommand { projectId: string; blueprintId: string; metadataId: string; generatedBy?: string }
export interface ExportCreationCommand {
  projectId: string; blueprintId: string; metadataId: string; tocId: string;
  coverPromptId: string; formats: ExportFormat[]; createdBy?: string;
}
