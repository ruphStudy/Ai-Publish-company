export interface AIClassificationConfig {
  classificationVersion: string;
  highDemandTrendScore: number;
  mediumDemandTrendScore: number;
  highDemandSearchVolume: number;
  mediumDemandSearchVolume: number;
  highCompetitionReviewCount: number;
  mediumCompetitionReviewCount: number;
  evergreenTrendScoreMaximum: number;
  seasonalKeywordScore: number;
  maxTags: number;
}

export const AI_CLASSIFICATION_CONFIG_TOKEN = 'AI_CLASSIFICATION_CONFIG';

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function loadAIClassificationConfig(): AIClassificationConfig {
  return {
    classificationVersion: process.env.AI_CLASSIFICATION_VERSION ?? '1.0.0',
    highDemandTrendScore: parseNumber(
      process.env.AI_CLASSIFICATION_HIGH_DEMAND_TREND_SCORE,
      70,
    ),
    mediumDemandTrendScore: parseNumber(
      process.env.AI_CLASSIFICATION_MEDIUM_DEMAND_TREND_SCORE,
      35,
    ),
    highDemandSearchVolume: parseNumber(
      process.env.AI_CLASSIFICATION_HIGH_DEMAND_SEARCH_VOLUME,
      70,
    ),
    mediumDemandSearchVolume: parseNumber(
      process.env.AI_CLASSIFICATION_MEDIUM_DEMAND_SEARCH_VOLUME,
      35,
    ),
    highCompetitionReviewCount: parseNumber(
      process.env.AI_CLASSIFICATION_HIGH_COMPETITION_REVIEW_COUNT,
      500,
    ),
    mediumCompetitionReviewCount: parseNumber(
      process.env.AI_CLASSIFICATION_MEDIUM_COMPETITION_REVIEW_COUNT,
      100,
    ),
    evergreenTrendScoreMaximum: parseNumber(
      process.env.AI_CLASSIFICATION_EVERGREEN_TREND_SCORE_MAXIMUM,
      45,
    ),
    seasonalKeywordScore: parseNumber(
      process.env.AI_CLASSIFICATION_SEASONAL_KEYWORD_SCORE,
      80,
    ),
    maxTags: parsePositiveInteger(process.env.AI_CLASSIFICATION_MAX_TAGS, 20),
  };
}