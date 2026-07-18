import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { join, basename } from 'path';
import * as fs from 'fs-extra';
import { exportConfig } from './config/export.config';

@Injectable()
export class ExportStorageService {
  async store(
    exportJobId: string,
    filename: string,
    buffer: Buffer,
  ): Promise<{
    storagePath: string;
    downloadUrl: string;
    checksum: string;
    fileSize: number;
  }> {
    const directory = join(exportConfig.storage.localPath, exportJobId);
    await fs.ensureDir(directory);

    const storagePath = join(directory, `${randomUUID()}-${filename}`);
    await fs.writeFile(storagePath, buffer);

    return {
      storagePath,
      downloadUrl: `${exportConfig.storage.publicBaseUrl}/${exportJobId}/${basename(storagePath)}`,
      checksum: createHash('sha256').update(buffer).digest('hex'),
      fileSize: buffer.length,
    };
  }

  async read(exportJobId: string, filename: string): Promise<Buffer> {
    const storagePath = join(exportConfig.storage.localPath, exportJobId, filename);

    if (!(await fs.pathExists(storagePath))) {
      throw new NotFoundException('Export file not found');
    }

    return fs.readFile(storagePath);
  }
}