import { Injectable } from '@nestjs/common';
import { ImportSalesDto, UploadSalesFileDto } from './dto';
import { SalesImportSource, SalesImportTrigger } from './entities/sales-ingestion.entity';
import { SalesIngestionEngine } from './sales-ingestion.engine';
import { SalesImportValidator } from './sales-import.validator';

@Injectable()
export class SalesImportCoordinator {
  constructor(private readonly engine: SalesIngestionEngine, private readonly validator: SalesImportValidator) {}
  import(dto: ImportSalesDto, userId?: string) { return this.engine.import(dto, userId); }
  upload(dto: UploadSalesFileDto, userId?: string) { this.validator.validateFile(dto); const records = this.parseDelimited(dto.content); return this.engine.import({ providerKey: dto.providerKey, projectId: dto.projectId, source: dto.source, trigger: SalesImportTrigger.MANUAL, fileName: dto.fileName, fileHash: dto.fileHash, records }, userId); }
  private parseDelimited(content: string) { const [headerLine, ...rows] = content.trim().split(/\r?\n/); const headers = headerLine.split(',').map((item) => item.trim()); return rows.filter(Boolean).map((row) => Object.fromEntries(row.split(',').map((value, index) => [headers[index], this.coerce(value.trim())]))) as never; }
  private coerce(value: string): string | number { const numeric = Number(value); return Number.isFinite(numeric) && value !== '' ? numeric : value; }
}
