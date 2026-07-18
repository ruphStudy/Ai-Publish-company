import { Injectable, Logger } from '@nestjs/common';
import { chapterGeneratorConfig } from '../config/chapter-generator.config';

@Injectable()
export class ChapterRetryStrategy {
  private readonly logger = new Logger(ChapterRetryStrategy.name);

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= chapterGeneratorConfig.retry.maxRetries;
      attempt += 1
    ) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === chapterGeneratorConfig.retry.maxRetries) {
          break;
        }

        const delay =
          chapterGeneratorConfig.retry.retryDelayMs * Math.pow(2, attempt);

        this.logger.warn(`Chapter generation retry ${attempt + 1}`);

        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}