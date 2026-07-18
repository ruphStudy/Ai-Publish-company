import { Injectable } from '@nestjs/common';
import { NormalizationEventType } from './entities/sales-royalty-normalization.entity';

@Injectable()
export class NormalizationEventPublisher {
  publish(eventType: NormalizationEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
