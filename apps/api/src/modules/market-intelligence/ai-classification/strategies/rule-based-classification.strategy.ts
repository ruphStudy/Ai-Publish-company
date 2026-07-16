import { Inject, Injectable } from '@nestjs/common';

import {
  AI_CLASSIFICATION_CONFIG_TOKEN,
  AIClassificationConfig,
} from '../config/ai-classification.config';
import { ClassificationStrategy } from '../interfaces/classification-strategy.interface';
import {
  ClassificationCompetitionLevel,
  ClassificationComplexity,
  ClassificationContentType,
  ClassificationContext,
  ClassificationDemandLevel,
  ClassificationMarketMaturity,
  ClassificationResult,
  ClassificationTopicType,
  ClassificationWritingStyle,
} from '../models/classification-result.model';

const SEASONAL_TERMS = [
  'christmas',
  'holiday',
  'summer',
  'winter',
  'spring',
  'autumn',
  'fall',
  'valentine',
  'halloween',
  'easter',
  'new year',
];

const BEGINNER_TERMS = ['beginner', 'introduction', 'intro', 'basic', 'basics'];
const ADVANCED_TERMS = ['advanced', 'professional', 'masterclass', 'expert'];
const EDUCATIONAL_TERMS = [
  'learn',
  'guide',
  'how to',
  'course',
  'tutorial',
  'workbook',
  'study',
  'training',
];
const COMMERCIAL_TERMS = [
  'business',
  'marketing',
  'sales',
  'finance',
  'investing',
  'career',
  'entrepreneur',
];
const WORKBOOK_TERMS = ['workbook', 'journal', 'planner', 'worksheet'];
const REFERENCE_TERMS = ['dictionary', 'encyclopedia', 'reference', 'handbook'];

@Injectable()
export class RuleBasedClassificationStrategy implements ClassificationStrategy {
  readonly key = 'rule-based-v1';
  readonly priority = 1;

  constructor(
    @Inject(AI_CLASSIFICATION_CONFIG_TOKEN)
    private readonly config: AIClassificationConfig,
  ) {}

  supports(): boolean {
    return true;
  }

  async classify(context: ClassificationContext): Promise<ClassificationResult> {
    const corpus = this.getCorpus(context);
    const seasonalScore = this.calculateSeasonalScore(corpus);
    const evergreenScore = this.calculateEvergreenScore(
      context.knowledge.trendScore,
      seasonalScore,
    );
    const demandLevel = this.detectDemandLevel(
      context.knowledge.trendScore,
      context.knowledge.searchVolume,
    );
    const competitionLevel = this.detectCompetitionLevel(
      context.knowledge.reviewCount,
    );
    const educationalIntent = this.includesAny(corpus, EDUCATIONAL_TERMS);
    const commercialIntent =
      this.includesAny(corpus, COMMERCIAL_TERMS) ||
      context.knowledge.price !== null;

    return {
      primaryCategory: context.knowledge.category,
      secondaryCategory: context.knowledge.subCategory,
      niche: context.knowledge.subCategory ?? context.knowledge.category,
      microNiche: this.detectMicroNiche(context),
      targetAudience: this.detectTargetAudience(corpus),
      contentType: this.detectContentType(context, corpus),
      writingStyle: this.detectWritingStyle(corpus, educationalIntent),
      complexity: this.detectComplexity(corpus),
      demandLevel,
      competitionLevel,
      marketMaturity: this.detectMarketMaturity(
        demandLevel,
        competitionLevel,
      ),
      topicType: this.detectTopicType(
        evergreenScore,
        seasonalScore,
        context.knowledge.trendScore,
      ),
      commercialIntent,
      educationalIntent,
      evergreenScore,
      seasonalScore,
      aiTags: this.generateTags(context, demandLevel, competitionLevel),
      confidenceScore: this.calculateConfidence(context),
      classificationVersion: context.classificationVersion,
      classifiedAt: new Date(),
    };
  }

  private getCorpus(context: ClassificationContext): string {
    return [
      context.knowledge.title,
      context.knowledge.subtitle,
      context.knowledge.description,
      context.knowledge.category,
      context.knowledge.subCategory,
      context.knowledge.author,
      context.knowledge.publisher,
      ...context.knowledge.keywords,
    ]
      .filter((value): value is string => Boolean(value))
      .join(' ')
      .toLowerCase();
  }

  private detectMicroNiche(context: ClassificationContext): string | null {
    const keyword = context.knowledge.keywords[0];

    if (context.knowledge.subCategory && keyword) {
      return `${context.knowledge.subCategory}: ${keyword}`;
    }

    return keyword ?? context.knowledge.subCategory ?? context.knowledge.category;
  }

  private detectTargetAudience(corpus: string): string | null {
    if (this.includesAny(corpus, BEGINNER_TERMS)) {
      return 'beginners';
    }

    if (this.includesAny(corpus, ADVANCED_TERMS)) {
      return 'advanced readers';
    }

    if (this.includesAny(corpus, ['children', 'kids', 'teen'])) {
      return 'young readers';
    }

    if (this.includesAny(corpus, ['professional', 'career', 'business'])) {
      return 'professionals';
    }

    return null;
  }

  private detectContentType(
    context: ClassificationContext,
    corpus: string,
  ): ClassificationContentType {
    if (context.knowledge.provider === 'google_trends') {
      return ClassificationContentType.TREND;
    }

    if (this.includesAny(corpus, WORKBOOK_TERMS)) {
      return corpus.includes('journal')
        ? ClassificationContentType.JOURNAL
        : ClassificationContentType.WORKBOOK;
    }

    if (this.includesAny(corpus, REFERENCE_TERMS)) {
      return ClassificationContentType.REFERENCE;
    }

    if (this.includesAny(corpus, ['guide', 'how to', 'tutorial'])) {
      return ClassificationContentType.GUIDE;
    }

    return ClassificationContentType.BOOK;
  }

  private detectWritingStyle(
    corpus: string,
    educationalIntent: boolean,
  ): ClassificationWritingStyle {
    if (educationalIntent) {
      return ClassificationWritingStyle.EDUCATIONAL;
    }

    if (this.includesAny(corpus, ['research', 'analysis', 'data', 'science'])) {
      return ClassificationWritingStyle.ANALYTICAL;
    }

    if (this.includesAny(corpus, ['motivation', 'inspiration', 'mindset'])) {
      return ClassificationWritingStyle.INSPIRATIONAL;
    }

    if (this.includesAny(corpus, ['reference', 'dictionary', 'encyclopedia'])) {
      return ClassificationWritingStyle.REFERENCE;
    }

    return ClassificationWritingStyle.PRACTICAL;
  }

  private detectComplexity(corpus: string): ClassificationComplexity {
    if (this.includesAny(corpus, ADVANCED_TERMS)) {
      return ClassificationComplexity.ADVANCED;
    }

    if (this.includesAny(corpus, BEGINNER_TERMS)) {
      return ClassificationComplexity.BEGINNER;
    }

    return ClassificationComplexity.INTERMEDIATE;
  }

  private detectDemandLevel(
    trendScore: number | null,
    searchVolume: number | null,
  ): ClassificationDemandLevel {
    const score = Math.max(trendScore ?? 0, searchVolume ?? 0);

    if (
      score >= this.config.highDemandTrendScore ||
      score >= this.config.highDemandSearchVolume
    ) {
      return ClassificationDemandLevel.HIGH;
    }

    if (
      score >= this.config.mediumDemandTrendScore ||
      score >= this.config.mediumDemandSearchVolume
    ) {
      return ClassificationDemandLevel.MEDIUM;
    }

    return ClassificationDemandLevel.LOW;
  }

  private detectCompetitionLevel(
    reviewCount: number | null,
  ): ClassificationCompetitionLevel {
    const count = reviewCount ?? 0;

    if (count >= this.config.highCompetitionReviewCount) {
      return ClassificationCompetitionLevel.HIGH;
    }

    if (count >= this.config.mediumCompetitionReviewCount) {
      return ClassificationCompetitionLevel.MEDIUM;
    }

    return ClassificationCompetitionLevel.LOW;
  }

  private detectMarketMaturity(
    demandLevel: ClassificationDemandLevel,
    competitionLevel: ClassificationCompetitionLevel,
  ): ClassificationMarketMaturity {
    if (
      demandLevel === ClassificationDemandLevel.HIGH &&
      competitionLevel === ClassificationCompetitionLevel.HIGH
    ) {
      return ClassificationMarketMaturity.SATURATED;
    }

    if (
      demandLevel === ClassificationDemandLevel.HIGH &&
      competitionLevel !== ClassificationCompetitionLevel.HIGH
    ) {
      return ClassificationMarketMaturity.GROWING;
    }

    if (
      demandLevel === ClassificationDemandLevel.MEDIUM &&
      competitionLevel === ClassificationCompetitionLevel.LOW
    ) {
      return ClassificationMarketMaturity.EMERGING;
    }

    return ClassificationMarketMaturity.MATURE;
  }

  private detectTopicType(
    evergreenScore: number,
    seasonalScore: number,
    trendScore: number | null,
  ): ClassificationTopicType {
    if (seasonalScore >= this.config.seasonalKeywordScore) {
      return ClassificationTopicType.SEASONAL;
    }

    if ((trendScore ?? 0) >= this.config.highDemandTrendScore) {
      return ClassificationTopicType.TRENDING;
    }

    if (evergreenScore >= this.config.evergreenTrendScoreMaximum) {
      return ClassificationTopicType.EVERGREEN;
    }

    return ClassificationTopicType.MIXED;
  }

  private calculateEvergreenScore(
    trendScore: number | null,
    seasonalScore: number,
  ): number {
    const trendComponent = 100 - Math.min(Math.max(trendScore ?? 0, 0), 100);

    return Math.max(0, Math.min(100, Math.round((trendComponent + (100 - seasonalScore)) / 2)));
  }

  private calculateSeasonalScore(corpus: string): number {
    return this.includesAny(corpus, SEASONAL_TERMS)
      ? this.config.seasonalKeywordScore
      : 0;
  }

  private generateTags(
    context: ClassificationContext,
    demandLevel: ClassificationDemandLevel,
    competitionLevel: ClassificationCompetitionLevel,
  ): string[] {
    const tags = [
      context.knowledge.category,
      context.knowledge.subCategory,
      context.knowledge.language,
      context.knowledge.format,
      context.knowledge.provider,
      demandLevel,
      competitionLevel,
      ...context.knowledge.keywords,
    ]
      .filter((value): value is string => Boolean(value))
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length > 0);

    return [...new Set(tags)].slice(0, this.config.maxTags);
  }

  private calculateConfidence(context: ClassificationContext): number {
    const values = [
      context.knowledge.category,
      context.knowledge.subCategory,
      context.knowledge.description,
      context.knowledge.language,
      context.knowledge.author,
      context.knowledge.publisher,
      context.knowledge.format,
      context.knowledge.trendScore,
      context.knowledge.searchVolume,
      context.knowledge.reviewCount,
      context.knowledge.rating,
    ];

    const populatedCount = values.filter(
      (value) => value !== null && value !== undefined,
    ).length;

    return Math.round((populatedCount / values.length) * 100);
  }

  private includesAny(corpus: string, values: string[]): boolean {
    return values.some((value) => corpus.includes(value));
  }
}