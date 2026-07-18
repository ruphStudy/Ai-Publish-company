import { Injectable, Logger } from '@nestjs/common';
import { aiWritingConfig } from '../config/ai-writing.config';

@Injectable()
export class AIWritingRetryStrategy {
  private readonly logger = new Logger(AIWritingRetryStrategy.name);

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= aiWritingConfig.retry.maxRetries;
      attempt += 1
    ) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        if (attempt === aiWritingConfig.retry.maxRetries) {
          break;
        }

        this.logger.warn(`AI writing retry ${attempt + 1}`);

        await new Promise<void>((resolve) =>
          setTimeout(
            resolve,
            aiWritingConfig.retry.retryDelayMs * Math.pow(2, attempt),
          ),
        );
      }
    }

    throw lastError;
  }
}