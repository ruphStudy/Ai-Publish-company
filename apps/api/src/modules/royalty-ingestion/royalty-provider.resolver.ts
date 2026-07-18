import { BadRequestException, Injectable } from '@nestjs/common';
import { royaltyIngestionDefaultPolicy } from './config/royalty-ingestion.config';
import { RoyaltyProviderCapability } from './entities/royalty-ingestion.entity';

@Injectable()
export class RoyaltyProviderResolver {
  resolve(providerKey: string, capability: RoyaltyProviderCapability) {
    const provider = royaltyIngestionDefaultPolicy.providers.find((item) => item.providerKey === providerKey);
    if (!provider?.enabled) throw new BadRequestException(`Royalty provider is not enabled: ${providerKey}`);
    if (!provider.capabilities.includes(capability)) throw new BadRequestException(`Royalty provider ${providerKey} does not support ${capability}`);
    return provider;
  }
}
