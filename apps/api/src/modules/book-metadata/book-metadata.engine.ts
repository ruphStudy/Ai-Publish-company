import { Injectable } from '@nestjs/common';
import { GeneratedBookMetadata } from './parsers/book-metadata-response.parser';

@Injectable()
export class BookMetadataEngine {
  normalize(payload: GeneratedBookMetadata): GeneratedBookMetadata {
    return {
      ...payload,
      title: payload.title.trim(),
      subtitle: payload.subtitle?.trim(),
      language: payload.language.trim().toLowerCase(),
      confidenceScore: Math.min(100, Math.max(0, payload.confidenceScore)),
    };
  }
}