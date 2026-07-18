import { Injectable } from '@nestjs/common';
import { OpportunityEventType } from './entities/opportunity-analytics.entity';

@Injectable()
export class OpportunityEventPublisher {
  publish(eventType: OpportunityEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
