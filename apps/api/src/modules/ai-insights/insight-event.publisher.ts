import { Injectable } from '@nestjs/common';
import { InsightEventType } from './entities/ai-insight.entity';

@Injectable()
export class InsightEventPublisher {
  publish(eventType: InsightEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
