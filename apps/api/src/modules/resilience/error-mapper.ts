import { Injectable } from '@nestjs/common';
import type { ClassifiedError } from './interfaces/resilience.interface';

@Injectable()
export class ErrorMapper {
  toSafeResponse(error: ClassifiedError) {
    return { category: error.category, retryable: error.retryable, code: error.code, message: error.message, providerKey: error.providerKey ?? null, marketplaceKey: error.marketplaceKey ?? null };
  }
}
