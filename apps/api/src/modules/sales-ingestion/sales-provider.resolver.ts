import { BadRequestException, Injectable } from '@nestjs/common';
import { salesIngestionDefaultPolicy } from './config/sales-ingestion.config';
import { SalesProviderCapability } from './entities/sales-ingestion.entity';

@Injectable()
export class SalesProviderResolver {
  resolve(providerKey: string, capability: SalesProviderCapability) {
    const provider = salesIngestionDefaultPolicy.providers.find((item) => item.providerKey === providerKey);
    if (!provider?.enabled) throw new BadRequestException(`Sales provider is not enabled: ${providerKey}`);
    if (!provider.capabilities.includes(capability)) throw new BadRequestException(`Sales provider ${providerKey} does not support ${capability}`);
    return provider;
  }
}
