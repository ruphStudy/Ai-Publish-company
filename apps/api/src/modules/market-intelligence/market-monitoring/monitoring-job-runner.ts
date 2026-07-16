import { Injectable } from '@nestjs/common';

import { AIClassificationService } from '../ai-classification/ai-classification.service';
import { DataNormalizerService } from '../data-normalizer/data-normalizer.service';
import { KnowledgeDatabaseService } from '../knowledge-database/knowledge-database.service';
import { OpportunityScoringService } from '../opportunity-scoring/opportunity-scoring.service';
import { ProviderFactoryService } from '../providers/factory/provider-factory.service';
import { TrendHistoryService } from '../trend-history/trend-history.service';
import {
  MonitoringJobDefinition,
  MonitoringRunResult,
} from './models/monitoring.model';

@Injectable()
export class MonitoringJobRunner {
  constructor(
    private readonly providerFactory: ProviderFactoryService,
    private readonly dataNormalizerService: DataNormalizerService,
    private readonly knowledgeDatabaseService: KnowledgeDatabaseService,
    private readonly classificationService: AIClassificationService,
    private readonly opportunityScoringService: OpportunityScoringService,
    private readonly trendHistoryService: TrendHistoryService,
  ) {}

  async run(job: MonitoringJobDefinition): Promise<MonitoringRunResult> {
    const startedAt = new Date();
    let processedRecords = 0;
    let failedRecords = 0;
    let skippedRecords = 0;

    const providerResponse = await this.providerFactory.execute(
      job.providerKey,
      job.params,
      job.providerConfig,
    );
    const normalized = await this.dataNormalizerService.normalize(providerResponse);

    skippedRecords += normalized.rejectedCount + normalized.duplicateCount;

    for (const record of normalized.records) {
      try {
        const knowledge = await this.knowledgeDatabaseService.upsert(record);
        const classification = await this.classificationService.classify(
          knowledge.id,
        );
        await this.opportunityScoringService.score(classification.id);
        await this.trendHistoryService.createSnapshot(knowledge.id);
        processedRecords += 1;
      } catch {
        failedRecords += 1;
      }
    }

    return {
      startedAt,
      completedAt: new Date(),
      processedRecords,
      failedRecords,
      skippedRecords,
    };
  }
}