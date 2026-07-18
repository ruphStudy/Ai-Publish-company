import type { ScoredData } from './opportunity-scoring.interface';

export interface KnowledgeUpdateResult {
  recordsUpdated: number;
  recordsCreated: number;
  errors: string[];
}

export const KNOWLEDGE_DB_UPDATER_TOKEN = 'KNOWLEDGE_DB_UPDATER';

export interface IKnowledgeDatabaseUpdater {
  update(scoredData: ScoredData[]): Promise<KnowledgeUpdateResult>;
  supports(dataVersion: string): boolean;
}
