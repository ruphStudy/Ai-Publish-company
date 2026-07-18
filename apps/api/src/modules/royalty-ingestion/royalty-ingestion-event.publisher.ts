import { Injectable } from '@nestjs/common';
import { RoyaltyIngestionEventType } from './entities/royalty-ingestion.entity';

@Injectable()
export class RoyaltyIngestionEventPublisher {
  publish(eventType: RoyaltyIngestionEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
