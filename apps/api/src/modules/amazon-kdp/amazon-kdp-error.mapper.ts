import { Injectable } from '@nestjs/common';
import type { PublishingProviderError } from '../publishing-workflow/interfaces/publishing-provider.interface';
@Injectable()
export class AmazonKdpErrorMapper {
  map(error: unknown): PublishingProviderError { return { code: 'AMAZON_KDP_MANUAL_INTEGRATION_ERROR', message: error instanceof Error ? error.message : 'Amazon KDP manual integration error', retryable: false, category: 'PROVIDER_CAPABILITY' }; }
  redact(input: Record<string, unknown>): Record<string, unknown> { return Object.fromEntries(Object.entries(input).filter(([key]) => !/password|cookie|mfa|token|secret|credential/i.test(key))); }
}
