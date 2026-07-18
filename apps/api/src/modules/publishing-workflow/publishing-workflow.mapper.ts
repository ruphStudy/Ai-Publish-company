import { Injectable } from '@nestjs/common';
import type { PublishingWorkflowDocument } from './entities/publishing-workflow.entity';

@Injectable()
export class PublishingWorkflowMapper {
  toResponse(item: PublishingWorkflowDocument) { const raw = item.toObject({ versionKey: true }) as Record<string, unknown>; return { ...raw, id: String(item._id) }; }
}
