export interface DataNormalizerConfig {
  maxKeywords: number;
  maxKeywordLength: number;
  maxMetadataEntries: number;
  maxMetadataArrayItems: number;
  maxMetadataDepth: number;
  maxStringLength: number;
}

export const DATA_NORMALIZER_CONFIG_TOKEN = 'DATA_NORMALIZER_CONFIG';

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadDataNormalizerConfig(): DataNormalizerConfig {
  return {
    maxKeywords: parsePositiveInteger(process.env.DATA_NORMALIZER_MAX_KEYWORDS, 50),
    maxKeywordLength: parsePositiveInteger(process.env.DATA_NORMALIZER_MAX_KEYWORD_LENGTH, 120),
    maxMetadataEntries: parsePositiveInteger(process.env.DATA_NORMALIZER_MAX_METADATA_ENTRIES, 100),
    maxMetadataArrayItems: parsePositiveInteger(
      process.env.DATA_NORMALIZER_MAX_METADATA_ARRAY_ITEMS,
      100,
    ),
    maxMetadataDepth: parsePositiveInteger(process.env.DATA_NORMALIZER_MAX_METADATA_DEPTH, 5),
    maxStringLength: parsePositiveInteger(process.env.DATA_NORMALIZER_MAX_STRING_LENGTH, 5000),
  };
}