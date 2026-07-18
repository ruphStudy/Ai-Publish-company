import { BadRequestException, Injectable } from '@nestjs/common';
import { salesRoyaltyNormalizationDefaultPolicy } from './config/sales-royalty-normalization.config';

@Injectable()
export class ProviderMappingResolver {
  resolve(providerKey: string) {
    if (!salesRoyaltyNormalizationDefaultPolicy.enabledProviders.includes(providerKey)) throw new BadRequestException(`Normalization provider is not enabled: ${providerKey}`);
    return salesRoyaltyNormalizationDefaultPolicy.mappingProfiles.find((profile) => (profile.providerKey === providerKey || profile.providerKey === '*') && profile.active) ?? salesRoyaltyNormalizationDefaultPolicy.mappingProfiles[0];
  }
}
