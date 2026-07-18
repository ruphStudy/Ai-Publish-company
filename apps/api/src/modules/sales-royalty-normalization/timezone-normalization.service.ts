import { Injectable } from '@nestjs/common';

@Injectable()
export class TimezoneNormalizationService {
  normalize(value?: string | null): string { return value || 'UTC'; }
  toUtc(date: Date | string, timezone?: string | null): Date { void timezone; return new Date(date); }
}
