import { Injectable } from '@nestjs/common';
import { FailureCategory } from './entities/resilience.entity';
import type { ClassifiedError } from './interfaces/resilience.interface';

@Injectable()
export class ErrorClassifier {
  classify(error: unknown): ClassifiedError {
    const message = error instanceof Error ? error.message : String(error ?? 'Unknown failure');
    const lower = message.toLowerCase();
    if (lower.includes('validation') || lower.includes('bad request')) return this.result(FailureCategory.VALIDATION, false, 'VALIDATION_FAILED', message);
    if (lower.includes('unauthorized') || lower.includes('authentication')) return this.result(FailureCategory.AUTHENTICATION, false, 'AUTHENTICATION_FAILED', message);
    if (lower.includes('forbidden') || lower.includes('authorization')) return this.result(FailureCategory.AUTHORIZATION, false, 'AUTHORIZATION_FAILED', message);
    if (lower.includes('timeout') || lower.includes('timed out')) return this.result(FailureCategory.TIMEOUT, true, 'TIMEOUT', message);
    if (lower.includes('rate') || lower.includes('429')) return this.result(FailureCategory.RATE_LIMITED, true, 'RATE_LIMITED', message);
    if (lower.includes('network') || lower.includes('econn') || lower.includes('socket')) return this.result(FailureCategory.NETWORK, true, 'NETWORK_FAILURE', message);
    if (lower.includes('mongo') || lower.includes('database')) return this.result(FailureCategory.DATABASE, true, 'DATABASE_FAILURE', message);
    if (lower.includes('queue') || lower.includes('bull')) return this.result(FailureCategory.QUEUE, true, 'QUEUE_FAILURE', message);
    if (lower.includes('storage') || lower.includes('s3') || lower.includes('minio')) return this.result(FailureCategory.STORAGE, true, 'STORAGE_FAILURE', message);
    if (lower.includes('conflict')) return this.result(FailureCategory.CONFLICT, false, 'CONFLICT', message);
    return this.result(FailureCategory.UNKNOWN, true, 'UNKNOWN_FAILURE', message);
  }

  private result(category: FailureCategory, retryable: boolean, code: string, message: string): ClassifiedError {
    return { category, retryable, code, message: message.slice(0, 500) };
  }
}
