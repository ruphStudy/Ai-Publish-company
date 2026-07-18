import { Injectable } from '@nestjs/common';
import type { CanonicalRoyaltyDocument } from '../sales-royalty-normalization/entities/canonical-royalty.entity';
import type { CanonicalSalesDocument } from '../sales-royalty-normalization/entities/canonical-sales.entity';
import { CanonicalPaymentStatus, CanonicalRoyaltyType, CanonicalTransactionType } from '../sales-royalty-normalization/entities/sales-royalty-normalization.entity';
import { AnalyticsMetricFactory } from './analytics-metric.factory';

@Injectable()
export class AnalyticsAggregationService {
  constructor(private readonly factory: AnalyticsMetricFactory) {}
  aggregate(sales: CanonicalSalesDocument[], royalties: CanonicalRoyaltyDocument[]) {
    const metrics = this.factory.empty();
    const uniqueDays = new Set<string>();
    for (const sale of sales) { const qty = sale.transactionType === CanonicalTransactionType.REFUND || sale.transactionType === CanonicalTransactionType.RETURN ? -sale.quantity : sale.quantity; metrics.unitsSold += qty; metrics.grossSales += Number(sale.grossAmount); metrics.netSales += Number(sale.netAmount); metrics.refundAmount += Number(sale.refundAmount); metrics.transactionCount += 1; if (qty < 0) metrics.refunds += Math.abs(qty); uniqueDays.add(sale.saleDateUtc.toISOString().slice(0, 10)); }
    for (const royalty of royalties) { const amount = Number(royalty.royaltyAmount); if (royalty.royaltyType === CanonicalRoyaltyType.ESTIMATED) metrics.estimatedRoyalty += amount; if (royalty.royaltyType === CanonicalRoyaltyType.FINAL) metrics.finalizedRoyalty += amount; if (royalty.paymentStatus === CanonicalPaymentStatus.PAID) metrics.paidRoyalty += amount; if (royalty.paymentStatus === CanonicalPaymentStatus.PENDING) metrics.pendingRoyalty += amount; if (royalty.paymentStatus === CanonicalPaymentStatus.WITHHELD) metrics.withheldRoyalty += amount; metrics.royaltyPaymentAmount += Number(royalty.paymentAmount); }
    metrics.averageSellingPrice = metrics.unitsSold > 0 ? metrics.netSales / metrics.unitsSold : null; metrics.averageRoyaltyPerUnit = metrics.unitsSold > 0 ? (metrics.finalizedRoyalty || metrics.estimatedRoyalty) / metrics.unitsSold : null; metrics.effectiveRoyaltyRate = metrics.netSales ? (metrics.finalizedRoyalty || metrics.estimatedRoyalty) / metrics.netSales : null;
    return { ...metrics, uniqueSellingDays: uniqueDays.size, salesPerDay: uniqueDays.size ? metrics.netSales / uniqueDays.size : 0, unitsPerDay: uniqueDays.size ? metrics.unitsSold / uniqueDays.size : 0 };
  }
  breakdown<T extends Record<string, unknown>>(items: T[], key: keyof T, amountKey: keyof T) { const total = items.reduce((sum, item) => sum + Number(item[amountKey] ?? 0), 0); return Object.values(items.reduce<Record<string, { key: string; value: number; count: number; contributionPercentage: number }>>((acc, item) => { const group = String(item[key] ?? 'UNKNOWN'); acc[group] ??= { key: group, value: 0, count: 0, contributionPercentage: 0 }; acc[group].value += Number(item[amountKey] ?? 0); acc[group].count += 1; return acc; }, {})).map((entry) => ({ ...entry, contributionPercentage: total ? (entry.value / total) * 100 : 0 })); }
}
