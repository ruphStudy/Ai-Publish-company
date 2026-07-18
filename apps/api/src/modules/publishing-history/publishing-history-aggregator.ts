import { Injectable } from '@nestjs/common';
import { PublishingHistoryDocument } from './entities/publishing-history.entity';

@Injectable()
export class PublishingHistoryAggregator {
  by(records: PublishingHistoryDocument[], groupBy?: string) {
    if (!groupBy) return [];
    return Object.values(records.reduce<Record<string, { key: string; records: PublishingHistoryDocument[]; count: number }>>((acc, record) => { const key = this.key(record, groupBy); acc[key] ??= { key, records: [], count: 0 }; acc[key].records.push(record); acc[key].count += 1; return acc; }, {}));
  }
  private key(record: PublishingHistoryDocument, groupBy: string): string { if (groupBy === 'provider') return record.providerKey ?? 'none'; if (groupBy === 'workflow') return record.workflowId ?? 'none'; if (groupBy === 'eventType') return record.eventType; if (groupBy === 'category') return record.category; if (groupBy === 'actor') return record.actor ?? 'system'; if (groupBy === 'date') return record.timestamp.toISOString().slice(0, 10); return 'all'; }
}
