import { Injectable } from '@nestjs/common';
import type { FilterQuery } from 'mongoose';
import { ImportRoyaltiesDto, RoyaltyImportQueryDto, SyncRoyaltiesDto, UploadRoyaltyFileDto } from './dto';
import { RoyaltyImportJob } from './entities/royalty-ingestion.entity';
import { RoyaltyImportCoordinator } from './royalty-import.coordinator';
import { RoyaltyImportRepository } from './royalty-import.repository';
import { RoyaltySyncCoordinator } from './royalty-sync.coordinator';

@Injectable()
export class RoyaltyIngestionService {
  constructor(private readonly imports: RoyaltyImportCoordinator, private readonly syncs: RoyaltySyncCoordinator, private readonly repository: RoyaltyImportRepository) {}
  import(dto: ImportRoyaltiesDto, userId?: string) { return this.imports.import(dto, userId); }
  uploadCsv(dto: UploadRoyaltyFileDto, userId?: string) { return this.imports.upload(dto, userId); }
  uploadExcel(dto: UploadRoyaltyFileDto, userId?: string) { return this.imports.upload(dto, userId); }
  syncProvider(dto: SyncRoyaltiesDto) { return this.syncs.sync(dto); }
  syncProject(projectId: string, dto: SyncRoyaltiesDto) { return this.syncs.sync({ ...dto, projectId }); }
  findByImportId(importId: string) { return this.repository.findByImportId(importId); }
  status(importId: string) { return this.repository.findByImportId(importId); }
  search(query: RoyaltyImportQueryDto) { const filter: FilterQuery<RoyaltyImportJob> = {}; if (query.providerKey) filter.providerKey = query.providerKey; if (query.projectId) filter.projectId = query.projectId; if (query.importId) filter.importId = query.importId; if (query.status) filter.status = query.status; return this.repository.paginate(filter, query.page, query.limit); }
}
