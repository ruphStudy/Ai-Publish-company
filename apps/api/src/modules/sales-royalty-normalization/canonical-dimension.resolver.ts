import { Injectable } from '@nestjs/common';
import { CanonicalFormat } from './entities/sales-royalty-normalization.entity';
import { salesRoyaltyNormalizationDefaultPolicy } from './config/sales-royalty-normalization.config';

@Injectable()
export class CanonicalDimensionResolver {
  alias(kind: string, value: string | null | undefined, fallback = 'UNKNOWN'): string { if (!value) return fallback; return salesRoyaltyNormalizationDefaultPolicy.valueAliases[kind]?.[String(value).toUpperCase()] ?? String(value).toUpperCase(); }
  format(value: string | null | undefined): CanonicalFormat { const mapped = this.alias('format', value, CanonicalFormat.UNKNOWN); return Object.values(CanonicalFormat).includes(mapped as CanonicalFormat) ? mapped as CanonicalFormat : CanonicalFormat.UNKNOWN; }
}
