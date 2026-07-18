import { Injectable } from '@nestjs/common';
import { CanonicalPaymentStatus, CanonicalRoyaltyType, CanonicalTransactionType } from './entities/sales-royalty-normalization.entity';
import { CanonicalDimensionResolver } from './canonical-dimension.resolver';

@Injectable()
export class NormalizationStrategyFactory {
  constructor(private readonly dimensions: CanonicalDimensionResolver) {}
  transactionType(value?: string | null): CanonicalTransactionType { const mapped = this.dimensions.alias('transactionType', value ?? 'SALE', CanonicalTransactionType.SALE); return Object.values(CanonicalTransactionType).includes(mapped as CanonicalTransactionType) ? mapped as CanonicalTransactionType : CanonicalTransactionType.UNKNOWN; }
  royaltyType(value?: string | null): CanonicalRoyaltyType { const mapped = this.dimensions.alias('royaltyType', value ?? 'FINAL', CanonicalRoyaltyType.FINAL); return Object.values(CanonicalRoyaltyType).includes(mapped as CanonicalRoyaltyType) ? mapped as CanonicalRoyaltyType : CanonicalRoyaltyType.UNKNOWN; }
  paymentStatus(value?: string | null): CanonicalPaymentStatus { const mapped = this.dimensions.alias('paymentStatus', value ?? 'PENDING', CanonicalPaymentStatus.PENDING); return Object.values(CanonicalPaymentStatus).includes(mapped as CanonicalPaymentStatus) ? mapped as CanonicalPaymentStatus : CanonicalPaymentStatus.UNKNOWN; }
}
