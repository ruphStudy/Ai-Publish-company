import { Injectable } from '@nestjs/common';
import { publishingHistoryDefaultPolicy } from './config/publishing-history.config';

@Injectable()
export class PublishingAuditEventMapper {
  mask(input: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
    if (!input) return null;
    const sensitive = new RegExp(publishingHistoryDefaultPolicy.maskedKeys.join('|'), 'i');
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, sensitive.test(key) ? '[redacted]' : typeof value === 'object' && value !== null ? this.mask(value as Record<string, unknown>) : value]));
  }
}
