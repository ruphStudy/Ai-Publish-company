import { Injectable } from '@nestjs/common';
import { PublicationStatusEventType } from './entities/publication-status-sync.entity';

@Injectable()
export class PublicationStatusEventPublisher {
  publish(eventType: PublicationStatusEventType, payload: Record<string, unknown>): Record<string, unknown> { return { eventType, emittedAt: new Date(), payload }; }
}
