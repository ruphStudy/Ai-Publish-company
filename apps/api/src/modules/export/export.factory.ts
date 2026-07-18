import { Injectable } from '@nestjs/common';
import { randomUUID, createHash } from 'crypto';
import { ExportArtifact, ExportFormat } from './entities/export-artifact.entity';
import { ExportJob} from './entities/export-job.entity';
import { ExportJobStatus } from './entities/export-job.entity';

@Injectable()
export class ExportFactory {
  createJob(
    projectId: string,
    formats: ExportFormat[],
    createdBy?: string,
  ): Partial<ExportJob> {
    return {
      exportJobId: `EXP-${randomUUID()}`,
      projectId,
      exportType: formats.length === 1 ? formats[0] : 'MULTI_FORMAT',
      formats,
      status: ExportJobStatus.PENDING,
      totalFileSize: 0,
      metadata: {},
      createdBy,
    };
  }

  createArtifact(
    exportJobId: string,
    format: ExportFormat,
    file: { filename: string; mimeType: string },
    storage: {
      storagePath: string;
      downloadUrl: string;
      checksum: string;
      fileSize: number;
    },
  ): ExportArtifact {
    return {
      artifactId: randomUUID(),
      exportJobId,
      format,
      filename: file.filename,
      fileExtension: file.filename.split('.').pop() ?? '',
      mimeType: file.mimeType,
      storageProvider: 'local',
      storagePath: storage.storagePath,
      downloadUrl: storage.downloadUrl,
      checksum: storage.checksum,
      fileSize: storage.fileSize,
      generatedAt: new Date(),
    };
  }

  checksum(values: string[]): string {
    return createHash('sha256').update(values.join('|')).digest('hex');
  }
}