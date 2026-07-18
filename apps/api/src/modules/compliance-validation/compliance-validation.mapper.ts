import { Injectable } from '@nestjs/common';
import type { ComplianceValidationDocument } from './entities/compliance-validation.entity';

@Injectable()
export class ComplianceValidationMapper {
  toResponse(item: ComplianceValidationDocument) { const raw = item.toObject({ versionKey: true }) as Record<string, unknown>; return { ...raw, id: String(item._id) }; }
}
