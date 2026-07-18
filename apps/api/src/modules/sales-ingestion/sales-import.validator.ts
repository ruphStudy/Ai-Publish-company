import { BadRequestException, Injectable } from '@nestjs/common';
import { salesIngestionDefaultPolicy } from './config/sales-ingestion.config';
import { ImportSalesDto, UploadSalesFileDto } from './dto';
import { SalesImportSource } from './entities/sales-ingestion.entity';

@Injectable()
export class SalesImportValidator {
  validateImport(dto: ImportSalesDto): void { if (!dto.records.length) throw new BadRequestException('At least one sales record is required'); dto.records.forEach((record, index) => { if (!record.saleDate) throw new BadRequestException(`Record ${index} is missing saleDate`); if (record.quantity < 0) throw new BadRequestException(`Record ${index} has invalid quantity`); }); }
  validateFile(dto: UploadSalesFileDto): void { const extension = dto.fileName.split('.').pop()?.toLowerCase(); if (!extension || !salesIngestionDefaultPolicy.supportedFileFormats.includes(extension)) throw new BadRequestException('Unsupported sales import file format'); if (![SalesImportSource.CSV, SalesImportSource.EXCEL].includes(dto.source)) throw new BadRequestException('File uploads must use CSV or EXCEL source'); }
}
