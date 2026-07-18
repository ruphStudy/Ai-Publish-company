import { Injectable } from '@nestjs/common';
import { PublishingHistoryDocument } from './entities/publishing-history.entity';
import { PublishingHistoryAggregator } from './publishing-history-aggregator';

@Injectable()
export class PublishingTimelineBuilder {
  constructor(private readonly aggregator: PublishingHistoryAggregator) {}
  build(records: PublishingHistoryDocument[], groupBy?: string) { const chronological = [...records].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); return { records: chronological, groups: this.aggregator.by(chronological, groupBy), count: chronological.length, firstEventAt: chronological[0]?.timestamp ?? null, lastEventAt: chronological.at(-1)?.timestamp ?? null }; }
}
