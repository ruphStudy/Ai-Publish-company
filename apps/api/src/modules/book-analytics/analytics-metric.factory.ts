import { Injectable } from '@nestjs/common';
import { AnalyticsMetricValues } from './interfaces/book-analytics.interface';

@Injectable()
export class AnalyticsMetricFactory {
  empty(): AnalyticsMetricValues { return { unitsSold: 0, grossSales: 0, netSales: 0, refunds: 0, refundAmount: 0, transactionCount: 0, estimatedRoyalty: 0, finalizedRoyalty: 0, paidRoyalty: 0, pendingRoyalty: 0, withheldRoyalty: 0, royaltyPaymentAmount: 0, averageSellingPrice: null, averageRoyaltyPerUnit: null, effectiveRoyaltyRate: null }; }
}
