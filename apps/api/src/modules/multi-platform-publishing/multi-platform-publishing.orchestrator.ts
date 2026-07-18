import { Injectable } from '@nestjs/common';
import { MultiPlatformPublishingService } from './multi-platform-publishing.service';

@Injectable()
export class MultiPlatformPublishingOrchestrator {
  constructor(private readonly service: MultiPlatformPublishingService) {}
  run(orchestrationId: string) { return this.service.start(orchestrationId); }
  resume(orchestrationId: string, userId?: string) { return this.service.resume(orchestrationId, userId); }
}
