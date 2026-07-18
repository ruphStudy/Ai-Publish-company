import { Injectable } from '@nestjs/common';
import { SalesIngestionEventType } from './entities/sales-ingestion.entity';

@Injectable()
export class SalesIngestionEventPublisher {
  publish(eventType: SalesIngestionEventType, payload: Record<string, unknown>) { return { eventType, emittedAt: new Date(), payload }; }
}
