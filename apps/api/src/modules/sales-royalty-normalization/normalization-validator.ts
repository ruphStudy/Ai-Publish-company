import { BadRequestException, Injectable } from '@nestjs/common';
import { NormalizeRequestDto } from './dto';

@Injectable()
export class NormalizationValidator {
  validateRequest(dto: NormalizeRequestDto): void { if (!dto.projectId && !dto.providerKey && !dto.importIds?.length && !dto.sourceRecordId) throw new BadRequestException('Normalization request must include a project, provider, import, or source record'); }
  validateSource(record: unknown): void { if (!record || typeof record !== 'object') throw new BadRequestException('Source record is invalid'); }
}
