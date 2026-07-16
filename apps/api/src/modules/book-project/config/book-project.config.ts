export interface BookProjectConfig {
  codePrefix: string;
  maximumCodeGenerationAttempts: number;
}

export const BOOK_PROJECT_CONFIG_TOKEN = 'BOOK_PROJECT_CONFIG';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadBookProjectConfig(): BookProjectConfig {
  return {
    codePrefix: process.env.BOOK_PROJECT_CODE_PREFIX ?? 'BPE',
    maximumCodeGenerationAttempts: parsePositiveInteger(
      process.env.BOOK_PROJECT_MAXIMUM_CODE_GENERATION_ATTEMPTS,
      5,
    ),
  };
}