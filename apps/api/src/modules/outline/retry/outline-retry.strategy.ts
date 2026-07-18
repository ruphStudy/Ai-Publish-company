import { Injectable, Logger } from '@nestjs/common';
import { outlineConfig } from '../config/outline.config';

@Injectable()
export class OutlineRetryStrategy {
  private readonly logger = new Logger(OutlineRetryStrategy.name);

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= outlineConfig.retry.maxRetries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === outlineConfig.retry.maxRetries) {
          break;
        }

        const delay =
          outlineConfig.retry.retryDelayMs * Math.pow(2, attempt);

        this.logger.warn(`Outline generation retry ${attempt + 1}`, {
          delay,
          error: error instanceof Error ? error.message : String(error),
        });

        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }
}