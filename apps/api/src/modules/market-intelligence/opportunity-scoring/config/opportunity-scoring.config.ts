export interface OpportunityScoringWeights {
  demand: number;
  competition: number;
  trend: number;
  growth: number;
  quality: number;
  profitability: number;
  confidence: number;
}

export interface OpportunityScoringConfig {
  scoreVersion: string;
  weights: OpportunityScoringWeights;
  gradeAThreshold: number;
  gradeBThreshold: number;
  gradeCThreshold: number;
  gradeDThreshold: number;
  prioritizeThreshold: number;
  validateThreshold: number;
  monitorThreshold: number;
}

export const OPPORTUNITY_SCORING_CONFIG_TOKEN = 'OPPORTUNITY_SCORING_CONFIG';

function parseNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function loadOpportunityScoringConfig(): OpportunityScoringConfig {
  return {
    scoreVersion: process.env.OPPORTUNITY_SCORING_VERSION ?? '1.0.0',
    weights: {
      demand: parseNumber(process.env.OPPORTUNITY_SCORING_WEIGHT_DEMAND, 20),
      competition: parseNumber(
        process.env.OPPORTUNITY_SCORING_WEIGHT_COMPETITION,
        15,
      ),
      trend: parseNumber(process.env.OPPORTUNITY_SCORING_WEIGHT_TREND, 15),
      growth: parseNumber(process.env.OPPORTUNITY_SCORING_WEIGHT_GROWTH, 10),
      quality: parseNumber(process.env.OPPORTUNITY_SCORING_WEIGHT_QUALITY, 10),
      profitability: parseNumber(
        process.env.OPPORTUNITY_SCORING_WEIGHT_PROFITABILITY,
        15,
      ),
      confidence: parseNumber(
        process.env.OPPORTUNITY_SCORING_WEIGHT_CONFIDENCE,
        15,
      ),
    },
    gradeAThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_GRADE_A_THRESHOLD,
      80,
    ),
    gradeBThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_GRADE_B_THRESHOLD,
      65,
    ),
    gradeCThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_GRADE_C_THRESHOLD,
      50,
    ),
    gradeDThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_GRADE_D_THRESHOLD,
      35,
    ),
    prioritizeThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_PRIORITIZE_THRESHOLD,
      75,
    ),
    validateThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_VALIDATE_THRESHOLD,
      55,
    ),
    monitorThreshold: parseNumber(
      process.env.OPPORTUNITY_SCORING_MONITOR_THRESHOLD,
      35,
    ),
  };
}