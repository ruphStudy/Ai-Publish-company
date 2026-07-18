import { Injectable } from '@nestjs/common';
import { CanonicalDimensionResolver } from './canonical-dimension.resolver';

@Injectable()
export class LanguageNormalizationService { constructor(private readonly dimensions: CanonicalDimensionResolver) {} normalize(value?: string | null): string { return this.dimensions.alias('language', value, 'und'); } }
