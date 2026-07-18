import { Injectable } from '@nestjs/common';
import { ExportFormat } from './entities/export-artifact.entity';
import { ExportEngine } from './export.engine';
import { ExportFactory } from './export.factory';
import { ExportProviderFactory } from './export.providers';
import { ExportStorageService } from './export-storage.service';
import { ExportContentSource, ExportMetadataSource, ExportTocSource } from './interfaces/export-provider.interface';

@Injectable()
export class ExportPipeline {
  constructor(
    private readonly exportEngine: ExportEngine,
    private readonly providerFactory: ExportProviderFactory,
    private readonly storageService: ExportStorageService,
    private readonly exportFactory: ExportFactory,
  ) {}

  async execute(
    exportJobId: string,
    formats: ExportFormat[],
    metadata: ExportMetadataSource,
    toc: ExportTocSource,
    contents: ExportContentSource[],
  ) {
    const manuscript = this.exportEngine.assemble(metadata, toc, contents);
    const artifacts = [];

    for (const format of formats) {
      const generated = await this.providerFactory
        .getProvider(format)
        .generate(manuscript);
      const stored = await this.storageService.store(
        exportJobId,
        generated.filename,
        generated.buffer,
      );

      artifacts.push(
        this.exportFactory.createArtifact(exportJobId, format, generated, stored),
      );
    }

    return artifacts;
  }
}
