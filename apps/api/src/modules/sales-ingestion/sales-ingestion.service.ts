import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { ImportSalesDto, SalesImportQueryDto, SyncSalesDto, UploadSalesFileDto } from './dto';
import { SalesImportJob } from './entities/sales-ingestion.entity';
import { SalesImportCoordinator } from './sales-import.coordinator';
import { SalesImportRepository } from './sales-import.repository';
import { SalesSyncCoordinator } from './sales-sync.coordinator';

@Injectable()
export class SalesIngestionService {
  constructor(private readonly imports: SalesImportCoordinator, private readonly syncs: SalesSyncCoordinator, private readonly repository: SalesImportRepository) {}
  import(dto: ImportSalesDto, userId?: string) { return this.imports.import(dto, userId); }
  uploadCsv(dto: UploadSalesFileDto, userId?: string) { return this.imports.upload(dto, userId); }
  uploadExcel(dto: UploadSalesFileDto, userId?: string) { return this.imports.upload(dto, userId); }
  syncProvider(dto: SyncSalesDto) { return this.syncs.sync(dto); }
  syncProject(projectId: string, dto: SyncSalesDto) { return this.syncs.sync({ ...dto, projectId }); }
  findByImportId(importId: string) { return this.repository.findByImportId(importId); }
  status(importId: string) { return this.repository.findByImportId(importId); }
  search(query: SalesImportQueryDto) { const filter: FilterQuery<SalesImportJob> = {}; if (query.providerKey) filter.providerKey = query.providerKey; if (query.projectId) filter.projectId = query.projectId; if (query.importId) filter.importId = query.importId; if (query.status) filter.status = query.status; return this.repository.paginate(filter, query.page, query.limit); }
}
