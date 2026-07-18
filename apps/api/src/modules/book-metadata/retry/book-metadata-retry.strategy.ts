import { Injectable, Logger } from '@nestjs/common';
import { bookMetadataConfig } from '../config/book-metadata.config';

@Injectable()
export class BookMetadataRetryStrategy {
  private readonly logger = new Logger(BookMetadataRetryStrategy.name);

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= bookMetadataConfig.retry.maxRetries;
      attempt += 1
    ) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === bookMetadataConfig.retry.maxRetries) {
          break;
        }

        this.logger.warn(`Metadata generation retry ${attempt + 1}`);

        await new Promise<void>((resolve) =>
          setTimeout(
            resolve,
            bookMetadataConfig.retry.retryDelayMs * Math.pow(2, attempt),
          ),
        );
      }
    }

    throw lastError;
  }
}