import { BadRequestException, Injectable } from '@nestjs/common';
import { royaltyIngestionDefaultPolicy } from './config/royalty-ingestion.config';
import { ImportRoyaltiesDto, UploadRoyaltyFileDto } from './dto';
import { RoyaltyImportSource } from './entities/royalty-ingestion.entity';

@Injectable()
export class RoyaltyImportValidator {
  validateImport(dto: ImportRoyaltiesDto): void { if (!dto.records.length) throw new BadRequestException('At least one royalty record is required'); dto.records.forEach((record, index) => { if (!record.royaltyPeriod) throw new BadRequestException(`Record ${index} is missing royaltyPeriod`); if (!Number.isFinite(Number(record.royaltyAmount))) throw new BadRequestException(`Record ${index} has invalid royaltyAmount`); }); }
  validateFile(dto: UploadRoyaltyFileDto): void { const extension = dto.fileName.split('.').pop()?.toLowerCase(); if (!extension || !royaltyIngestionDefaultPolicy.supportedFileFormats.includes(extension)) throw new BadRequestException('Unsupported royalty import file format'); if (![RoyaltyImportSource.CSV, RoyaltyImportSource.EXCEL].includes(dto.source)) throw new BadRequestException('File uploads must use CSV or EXCEL source'); }
}
