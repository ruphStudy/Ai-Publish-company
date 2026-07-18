import { Injectable } from '@nestjs/common';
import { AnalyticsEventType } from './entities/book-analytics.entity';

@Injectable()
export class BookAnalyticsEventPublisher {
  publish(eventType: AnalyticsEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
