import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';

import {
  BookBlueprintConfig} from './config/book-blueprint.config';
import {
  BOOK_BLUEPRINT_CONFIG_TOKEN
} from './config/book-blueprint.config';

@Injectable()
export class BookBlueprintFactory {
  constructor(
    @Inject(BOOK_BLUEPRINT_CONFIG_TOKEN)
    private readonly config: BookBlueprintConfig,
  ) {}

  createBlueprintId(): string {
    const date = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const identifier = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();

    return `${this.config.identifierPrefix}-${date}-${identifier}`;
  }

  getBlueprintVersion(): string {
    return this.config.blueprintVersion;
  }

  getDefaultEstimatedWordCount(): number {
    return this.config.defaultEstimatedWordCount;
  }

  getDefaultEstimatedChapterCount(): number {
    return this.config.defaultEstimatedChapterCount;
  }

  getMaximumIdentifierGenerationAttempts(): number {
    return this.config.maximumIdentifierGenerationAttempts;
  }
}