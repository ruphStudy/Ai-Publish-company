import { Injectable } from '@nestjs/common';
import { salesRoyaltyNormalizationDefaultPolicy } from './config/sales-royalty-normalization.config';

@Injectable()
export class FinancialValueNormalizer {
  money(value: number | string | null | undefined): string { return Number(value ?? 0).toFixed(salesRoyaltyNormalizationDefaultPolicy.decimalPrecision); }
  unitPrice(amount: number | string | null | undefined, quantity: number): string | null { return quantity > 0 ? (Number(amount ?? 0) / quantity).toFixed(salesRoyaltyNormalizationDefaultPolicy.decimalPrecision) : null; }
}
