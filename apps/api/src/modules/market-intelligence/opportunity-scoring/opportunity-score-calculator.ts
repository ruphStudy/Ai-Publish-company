import { Inject, Injectable } from '@nestjs/common';

import {
  AIClassificationConfig} from '../ai-classification/config/ai-classification.config';
import {
  AI_CLASSIFICATION_CONFIG_TOKEN
} from '../ai-classification/config/ai-classification.config';
import {
  ClassificationCompetitionLevel,
  ClassificationDemandLevel,
} from '../ai-classification/models/classification-result.model';
import {
  OpportunityScoringConfig} from './config/opportunity-scoring.config';
import {
  OPPORTUNITY_SCORING_CONFIG_TOKEN
} from './config/opportunity-scoring.config';
import {
  OpportunityScoreResult,
  OpportunityScoringContext} from './models/opportunity-score.model';
import {
  OpportunityGrade,
  OpportunityRecommendation
} from './models/opportunity-score.model';

@Injectable()
export class OpportunityScoreCalculator {
  constructor(
    @Inject(OPPORTUNITY_SCORING_CONFIG_TOKEN)
    private readonly config: OpportunityScoringConfig,
    @Inject(AI_CLASSIFICATION_CONFIG_TOKEN)
    private readonly classificationConfig: AIClassificationConfig,
  ) {}

  calculate(context: OpportunityScoringContext): OpportunityScoreResult {
    const demandScore = this.calculateDemandScore(context);
    const competitionScore = this.calculateCompetitionScore(context);
    const trendScore = this.normalizeScore(context.knowledge.trendScore);
    const growthScore = this.calculateGrowthScore(context);
    const qualityScore = this.calculateQualityScore(context);
    const profitabilityScore = this.calculateProfitabilityScore(context);
    const confidenceScore = this.normalizeScore(
      context.classification.confidenceScore,
    );
    const overallScore = this.calculateOverallScore({
      demandScore,
      competitionScore,
      trendScore,
      growthScore,
      qualityScore,
      profitabilityScore,
      confidenceScore,
    });
    const opportunityGrade = this.resolveGrade(overallScore);
    const recommendation = this.resolveRecommendation(overallScore);

    return {
      overallScore,
      demandScore,
      competitionScore,
      trendScore,
      growthScore,
      qualityScore,
      profitabilityScore,
      confidenceScore,
      opportunityGrade,
      recommendation,
      recommendationReason: this.buildRecommendationReason(
        recommendation,
        demandScore,
        competitionScore,
        trendScore,
        confidenceScore,
      ),
      scoreVersion: context.scoreVersion,
      scoredAt: new Date(),
    };
  }

  private calculateDemandScore(context: OpportunityScoringContext): number {
    const classificationScore = this.getDemandLevelScore(
      context.classification.demandLevel,
    );
    const trendScore = this.normalizeScore(context.knowledge.trendScore);
    const searchVolumeScore = this.normalizeScore(context.knowledge.searchVolume);

    return this.average([classificationScore, trendScore, searchVolumeScore]);
  }

  private calculateCompetitionScore(
    context: OpportunityScoringContext,
  ): number {
    const classificationScore = this.getCompetitionLevelScore(
      context.classification.competitionLevel,
    );
    const reviewScore = this.calculateInverseScore(
      context.knowledge.reviewCount,
      this.classificationConfig.highCompetitionReviewCount,
    );

    return this.average([classificationScore, reviewScore]);
  }

  private calculateGrowthScore(context: OpportunityScoringContext): number {
    const directionScore =
      context.knowledge.trendDirection === 'rising'
        ? 100
        : context.knowledge.trendDirection === 'stable'
          ? 60
          : context.knowledge.trendDirection === 'declining'
            ? 20
            : 50;

    const metadataGrowth = context.knowledge.metadata.growthPercentage;
    const growthScore =
      typeof metadataGrowth === 'number'
        ? this.normalizeScore(metadataGrowth)
        : directionScore;

    return this.average([directionScore, growthScore]);
  }

  private calculateQualityScore(context: OpportunityScoringContext): number {
    const ratingScore =
      context.knowledge.rating === null
        ? 50
        : this.normalizeScore(context.knowledge.rating * 20);
    const reviewScore = this.normalizeScore(context.knowledge.reviewCount);
    const descriptionScore = context.knowledge.description ? 100 : 40;
    const metadataScore = Object.keys(context.knowledge.metadata).length > 0 ? 100 : 40;

    return this.average([
      ratingScore,
      reviewScore,
      descriptionScore,
      metadataScore,
    ]);
  }

  private calculateProfitabilityScore(
    context: OpportunityScoringContext,
  ): number {
    if (context.knowledge.price === null) {
      return 50;
    }

    const priceScore = this.normalizeScore(context.knowledge.price * 10);
    const commercialIntentScore = context.classification.commercialIntent
      ? 100
      : 40;

    return this.average([priceScore, commercialIntentScore]);
  }

  private calculateOverallScore(scores: {
    demandScore: number;
    competitionScore: number;
    trendScore: number;
    growthScore: number;
    qualityScore: number;
    profitabilityScore: number;
    confidenceScore: number;
  }): number {
    const weights = this.config.weights;
    const totalWeight =
      weights.demand +
      weights.competition +
      weights.trend +
      weights.growth +
      weights.quality +
      weights.profitability +
      weights.confidence;

    if (totalWeight === 0) {
      return 0;
    }

    const weightedScore =
      scores.demandScore * weights.demand +
      scores.competitionScore * weights.competition +
      scores.trendScore * weights.trend +
      scores.growthScore * weights.growth +
      scores.qualityScore * weights.quality +
      scores.profitabilityScore * weights.profitability +
      scores.confidenceScore * weights.confidence;

    return this.normalizeScore(weightedScore / totalWeight);
  }

  private resolveGrade(score: number): OpportunityGrade {
    if (score >= this.config.gradeAThreshold) {
      return OpportunityGrade.A;
    }

    if (score >= this.config.gradeBThreshold) {
      return OpportunityGrade.B;
    }

    if (score >= this.config.gradeCThreshold) {
      return OpportunityGrade.C;
    }

    if (score >= this.config.gradeDThreshold) {
      return OpportunityGrade.D;
    }

    return OpportunityGrade.F;
  }

  private resolveRecommendation(score: number): OpportunityRecommendation {
    if (score >= this.config.prioritizeThreshold) {
      return OpportunityRecommendation.PRIORITIZE;
    }

    if (score >= this.config.validateThreshold) {
      return OpportunityRecommendation.VALIDATE;
    }

    if (score >= this.config.monitorThreshold) {
      return OpportunityRecommendation.MONITOR;
    }

    return OpportunityRecommendation.AVOID;
  }

  private buildRecommendationReason(
    recommendation: OpportunityRecommendation,
    demandScore: number,
    competitionScore: number,
    trendScore: number,
    confidenceScore: number,
  ): string {
    return [
      `Recommendation: ${recommendation}.`,
      `Demand score: ${demandScore}.`,
      `Competition score: ${competitionScore}.`,
      `Trend score: ${trendScore}.`,
      `Confidence score: ${confidenceScore}.`,
    ].join(' ');
  }

  private getDemandLevelScore(level: ClassificationDemandLevel): number {
    if (level === ClassificationDemandLevel.HIGH) {
      return 100;
    }

    if (level === ClassificationDemandLevel.MEDIUM) {
      return 60;
    }

    return 25;
  }

  private getCompetitionLevelScore(
    level: ClassificationCompetitionLevel,
  ): number {
    if (level === ClassificationCompetitionLevel.LOW) {
      return 100;
    }

    if (level === ClassificationCompetitionLevel.MEDIUM) {
      return 60;
    }

    return 25;
  }

  private calculateInverseScore(value: number | null, maximum: number): number {
    if (value === null || maximum <= 0) {
      return 50;
    }

    return this.normalizeScore(100 - (value / maximum) * 100);
  }

  private average(values: number[]): number {
    return this.normalizeScore(
      values.reduce((sum, value) => sum + value, 0) / values.length,
    );
  }

  private normalizeScore(value: number | null): number {
    if (value === null || !Number.isFinite(value)) {
      return 0;
    }

    return Math.round(Math.max(0, Math.min(100, value)));
  }
}