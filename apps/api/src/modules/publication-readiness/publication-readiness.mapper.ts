import { Injectable } from '@nestjs/common';
import type { PublicationReadinessDocument } from './entities/publication-readiness.entity';

@Injectable()
export class PublicationReadinessMapper {
  toResponse(item: PublicationReadinessDocument) { const raw = item.toObject({ versionKey: true }) as Record<string, unknown>; return { ...raw, id: String(item._id) }; }
}
