import { Injectable } from '@nestjs/common';
import type { MultiPlatformPublishingOrchestrationDocument } from './entities/multi-platform-publishing.entity';

@Injectable()
export class MultiPlatformPublishingMapper {
  toResponse(item: MultiPlatformPublishingOrchestrationDocument) { const raw = item.toObject({ versionKey: true }) as Record<string, unknown>; return { ...raw, id: String(item._id) }; }
}
