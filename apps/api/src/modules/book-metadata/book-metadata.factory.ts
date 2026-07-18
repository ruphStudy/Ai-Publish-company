import { Injectable } from '@nestjs/common';
import { bookMetadataConfig } from './config/book-metadata.config';
import {
  BookMetadata} from './entities/book-metadata.entity';
import {
  BookMetadataStatus,
} from './entities/book-metadata.entity';
import { MetadataProviderResponse } from './interfaces/ai-metadata-provider.interface';
import { GeneratedBookMetadata } from './parsers/book-metadata-response.parser';

@Injectable()
export class MetadataFactory {
  create(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    generated: GeneratedBookMetadata,
    provider: MetadataProviderResponse,
    generatedBy?: string,
  ): Partial<BookMetadata> {
    return {
      metadataId: this.createMetadataId(),
      projectId: String(project._id ?? project.id),
      blueprintId: String(blueprint._id ?? blueprint.id),
      title: generated.title.trim(),
      subtitle: generated.subtitle?.trim(),
      shortDescription: generated.shortDescription.trim(),
      longDescription: generated.longDescription.trim(),
      seoDescription: generated.seoDescription.trim(),
      amazonDescription: generated.amazonDescription.trim(),
      googleDescription: generated.googleDescription.trim(),
      draft2digitalDescription: generated.draft2digitalDescription.trim(),
      keywords: generated.keywords ?? [],
      backendKeywords: generated.backendKeywords ?? [],
      bisacCategories: generated.bisacCategories ?? [],
      amazonCategories: generated.amazonCategories ?? [],
      googleCategories: generated.googleCategories ?? [],
      language: generated.language.trim(),
      readingLevel: generated.readingLevel?.trim(),
      ageGroup: generated.ageGroup?.trim(),
      edition: generated.edition?.trim() ?? 'First Edition',
      authorName: generated.authorName?.trim(),
      authorBiography: generated.authorBiography?.trim(),
      publisherName: generated.publisherName?.trim(),
      copyrightText: generated.copyrightText.trim(),
      isbn: generated.isbn?.trim(),
      confidenceScore: generated.confidenceScore,
      aiProvider: provider.provider,
      aiModel: provider.model,
      promptVersion: bookMetadataConfig.generation.promptVersion,
      metadataVersion: bookMetadataConfig.generation.metadataVersion,
      status: BookMetadataStatus.GENERATED,
      metadata: {
        requestId: provider.requestId,
        publishingRecommendations: generated.publishingRecommendations ?? [],
        generatedAt: new Date().toISOString(),
      },
      createdBy: generatedBy,
      updatedBy: generatedBy,
    };
  }

  private createMetadataId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = Math.random().toString(36).slice(2, 10).toUpperCase();

    return `MET-${date}-${suffix}`;
  }
}