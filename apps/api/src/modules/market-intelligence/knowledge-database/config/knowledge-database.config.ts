export interface KnowledgeDatabaseConfig {
  maxBatchSize: number;
}

export const KNOWLEDGE_DATABASE_CONFIG_TOKEN = 'KNOWLEDGE_DATABASE_CONFIG';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadKnowledgeDatabaseConfig(): KnowledgeDatabaseConfig {
  return {
    maxBatchSize: parsePositiveInteger(process.env.KNOWLEDGE_DATABASE_MAX_BATCH_SIZE, 100),
  };
}