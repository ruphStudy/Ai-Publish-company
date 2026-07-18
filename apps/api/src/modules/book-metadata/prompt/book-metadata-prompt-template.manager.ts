import { Injectable } from '@nestjs/common';
import { bookMetadataConfig } from '../config/book-metadata.config';

@Injectable()
export class BookMetadataPromptTemplateManager {
  getVersion(): string {
    return bookMetadataConfig.generation.promptVersion;
  }

  getInstructions(): string {
    return `Generate publishing-ready metadata. Return valid JSON only using this exact structure:
{
  "title": "string",
  "subtitle": "string",
  "shortDescription": "string",
  "longDescription": "string",
  "seoDescription": "string",
  "amazonDescription": "string",
  "googleDescription": "string",
  "draft2digitalDescription": "string",
  "keywords": ["string"],
  "backendKeywords": ["string"],
  "bisacCategories": ["string"],
  "amazonCategories": ["string"],
  "googleCategories": ["string"],
  "language": "string",
  "readingLevel": "string",
  "ageGroup": "string",
  "edition": "string",
  "authorName": "string",
  "authorBiography": "string",
  "publisherName": "string",
  "copyrightText": "string",
  "isbn": "string",
  "confidenceScore": 0,
  "publishingRecommendations": ["string"]
}`;
  }
}