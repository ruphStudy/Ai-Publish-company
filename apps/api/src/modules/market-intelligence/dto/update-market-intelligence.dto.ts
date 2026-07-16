import { PartialType } from '@nestjs/swagger';

import { CreateMarketIntelligenceDto } from './create-market-intelligence.dto';

export class UpdateMarketIntelligenceDto extends PartialType(CreateMarketIntelligenceDto) {}
