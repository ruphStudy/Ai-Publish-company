import { Injectable } from '@nestjs/common';
import { ImportRoyaltiesDto, UploadRoyaltyFileDto } from './dto';
import { RoyaltyImportTrigger } from './entities/royalty-ingestion.entity';
import { RoyaltyIngestionEngine } from './royalty-ingestion.engine';
import { RoyaltyImportValidator } from './royalty-import.validator';

@Injectable()
export class RoyaltyImportCoordinator {
  constructor(private readonly engine: RoyaltyIngestionEngine, private readonly validator: RoyaltyImportValidator) {}
  import(dto: ImportRoyaltiesDto, userId?: string) { return this.engine.import(dto, userId); }
  upload(dto: UploadRoyaltyFileDto, userId?: string) { this.validator.validateFile(dto); const records = this.parseDelimited(dto.content); return this.engine.import({ providerKey: dto.providerKey, projectId: dto.projectId, source: dto.source, trigger: RoyaltyImportTrigger.MANUAL, fileName: dto.fileName, fileHash: dto.fileHash, records }, userId); }
  private parseDelimited(content: string) { const [headerLine, ...rows] = content.trim().split(/\r?\n/); const headers = headerLine.split(',').map((item) => item.trim()); return rows.filter(Boolean).map((row) => Object.fromEntries(row.split(',').map((value, index) => [headers[index], this.coerce(value.trim())]))) as never; }
  private coerce(value: string): string | number | boolean { if (value === 'true') return true; if (value === 'false') return false; const numeric = Number(value); return Number.isFinite(numeric) && value !== '' ? numeric : value; }
}
