import { Injectable } from '@nestjs/common';
import { CanonicalDimensionResolver } from './canonical-dimension.resolver';

@Injectable()
export class FormatNormalizationService { constructor(private readonly dimensions: CanonicalDimensionResolver) {} normalize(value?: string | null) { return this.dimensions.format(value); } }
