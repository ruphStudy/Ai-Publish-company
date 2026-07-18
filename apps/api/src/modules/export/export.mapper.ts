import { Injectable } from '@nestjs/common';
import { ExportJobDocument } from './entities/export-job.entity';

@Injectable()
export class ExportMapper {
  toResponse(document: ExportJobDocument) {
    return {
      id: document.id,
      exportJobId: document.exportJobId,
      projectId: document.projectId,
      exportType: document.exportType,
      formats: document.formats,
      status: document.status,
      startedAt: document.startedAt,
      completedAt: document.completedAt,
      duration: document.duration,
      generatedFiles: document.generatedFiles,
      checksum: document.checksum,
      totalFileSize: document.totalFileSize,
      metadata: document.metadata,
      errorMessage: document.errorMessage,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}