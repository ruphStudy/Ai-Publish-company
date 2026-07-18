import { Injectable } from '@nestjs/common';
import { BookMetadataDocument } from './entities/book-metadata.entity';

@Injectable()
export class MetadataMapper {
  toResponse(document: BookMetadataDocument) {
    return {
      id: document.id,
      metadataId: document.metadataId,
      projectId: document.projectId,
      blueprintId: document.blueprintId,
      title: document.title,
      subtitle: document.subtitle,
      shortDescription: document.shortDescription,
      longDescription: document.longDescription,
      seoDescription: document.seoDescription,
      amazonDescription: document.amazonDescription,
      googleDescription: document.googleDescription,
      draft2digitalDescription: document.draft2digitalDescription,
      keywords: document.keywords,
      backendKeywords: document.backendKeywords,
      bisacCategories: document.bisacCategories,
      amazonCategories: document.amazonCategories,
      googleCategories: document.googleCategories,
      language: document.language,
      readingLevel: document.readingLevel,
      ageGroup: document.ageGroup,
      edition: document.edition,
      authorName: document.authorName,
      authorBiography: document.authorBiography,
      publisherName: document.publisherName,
      copyrightText: document.copyrightText,
      isbn: document.isbn,
      confidenceScore: document.confidenceScore,
      aiProvider: document.aiProvider,
      aiModel: document.aiModel,
      promptVersion: document.promptVersion,
      metadataVersion: document.metadataVersion,
      status: document.status,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}