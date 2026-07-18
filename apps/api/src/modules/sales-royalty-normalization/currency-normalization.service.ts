import { Injectable } from '@nestjs/common';
import { CanonicalDimensionResolver } from './canonical-dimension.resolver';

@Injectable()
export class CurrencyNormalizationService { constructor(private readonly dimensions: CanonicalDimensionResolver) {} normalize(value?: string | null): string { return this.dimensions.alias('currency', value, 'UNKNOWN'); } }
