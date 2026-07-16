import { randomUUID } from 'crypto';
import { Inject, Injectable } from '@nestjs/common';

import {
  BOOK_PROJECT_CONFIG_TOKEN,
  BookProjectConfig,
} from './config/book-project.config';

@Injectable()
export class BookProjectFactory {
  constructor(
    @Inject(BOOK_PROJECT_CONFIG_TOKEN)
    private readonly config: BookProjectConfig,
  ) {}

  createProjectCode(): string {
    const date = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const identifier = randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();

    return `${this.config.codePrefix}-${date}-${identifier}`;
  }

  getMaximumCodeGenerationAttempts(): number {
    return this.config.maximumCodeGenerationAttempts;
  }
}