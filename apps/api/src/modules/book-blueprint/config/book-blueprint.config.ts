export interface BookBlueprintConfig {
  identifierPrefix: string;
  blueprintVersion: string;
  defaultEstimatedWordCount: number;
  defaultEstimatedChapterCount: number;
  maximumIdentifierGenerationAttempts: number;
}

export const BOOK_BLUEPRINT_CONFIG_TOKEN = 'BOOK_BLUEPRINT_CONFIG';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadBookBlueprintConfig(): BookBlueprintConfig {
  return {
    identifierPrefix: process.env.BOOK_BLUEPRINT_IDENTIFIER_PREFIX ?? 'BBL',
    blueprintVersion: process.env.BOOK_BLUEPRINT_VERSION ?? '1.0.0',
    defaultEstimatedWordCount: parsePositiveInteger(
      process.env.BOOK_BLUEPRINT_DEFAULT_ESTIMATED_WORD_COUNT,
      50000,
    ),
    defaultEstimatedChapterCount: parsePositiveInteger(
      process.env.BOOK_BLUEPRINT_DEFAULT_ESTIMATED_CHAPTER_COUNT,
      12,
    ),
    maximumIdentifierGenerationAttempts: parsePositiveInteger(
      process.env.BOOK_BLUEPRINT_MAXIMUM_IDENTIFIER_GENERATION_ATTEMPTS,
      5,
    ),
  };
}