import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import {
  BookProjectResponseDto,
} from '../book-project/dto';
import {
  MarketIntelligenceResponseDto,
} from '../market-intelligence/dto';
import {
  AIClassificationResponseDto,
} from '../market-intelligence/ai-classification/dto';
import {
  MarketKnowledgeResponseDto,
} from '../market-intelligence/knowledge-database/dto';
import {
  OpportunityScoreResponseDto,
} from '../market-intelligence/opportunity-scoring/dto';
import {
  CreateBookBlueprintData,
} from './interfaces/book-blueprint.repository.interface';
import { BookBlueprintFactory } from './book-blueprint.factory';
import { BookBlueprintStatus } from './entities/book-blueprint.entity';

@Injectable()
export class BookBlueprintEngine {
  constructor(private readonly factory: BookBlueprintFactory) {}

  generate(
    blueprintId: string,
    project: BookProjectResponseDto,
    marketIntelligence: MarketIntelligenceResponseDto,
    knowledge: MarketKnowledgeResponseDto,
    classification: AIClassificationResponseDto,
    opportunityScore: OpportunityScoreResponseDto,
  ): CreateBookBlueprintData {
    const genre =
      classification.primaryCategory ??
      knowledge.category ??
      marketIntelligence.genre ??
      project.niche;
    const niche =
      classification.niche ??
      knowledge.subCategory ??
      project.niche ??
      genre;
    const microNiche =
      classification.microNiche ??
      project.microNiche ??
      knowledge.keywords[0] ??
      niche;
    const title = project.title;
    const subtitle =
      project.subtitle ??
      this.createSubtitle(niche, classification.targetAudience);
    const estimatedWordCount =
      project.estimatedWordCount ??
      this.factory.getDefaultEstimatedWordCount();
    const estimatedChapterCount =
      project.estimatedChapterCount ??
      this.factory.getDefaultEstimatedChapterCount();

    return {
      blueprintId,
      projectId: new Types.ObjectId(project.id),
      marketIntelligenceId: new Types.ObjectId(marketIntelligence.id),
      knowledgeRecordId: new Types.ObjectId(knowledge.id),
      classificationId: new Types.ObjectId(classification.id),
      opportunityScoreId: new Types.ObjectId(opportunityScore.id),
      title,
      subtitle,
      objective:
        project.objective ??
        `Create a practical and valuable book that helps readers succeed in ${niche ?? genre ?? 'the selected market'}.`,
      usp: this.createUsp(
        niche,
        classification.targetAudience,
        opportunityScore.overallScore,
      ),
      genre,
      niche,
      microNiche,
      targetAudience: project.targetAudience ?? classification.targetAudience,
      readerPersona: this.createReaderPersona(
        project.targetAudience ?? classification.targetAudience,
        niche,
      ),
      language: project.language,
      writingStyle: project.writingStyle ?? classification.writingStyle,
      tone: project.tone ?? this.resolveTone(classification.writingStyle),
      estimatedWordCount,
      estimatedChapterCount,
      targetPlatforms: project.targetPlatforms,
      publishingStrategy: this.createPublishingStrategy(
        project.targetPlatforms,
        opportunityScore.recommendation,
      ),
      seoKeywords: this.createSeoKeywords(
        title,
        genre,
        niche,
        microNiche,
        knowledge.keywords,
        project.tags,
      ),
      primaryCategory: classification.primaryCategory ?? knowledge.category,
      secondaryCategory:
        classification.secondaryCategory ?? knowledge.subCategory,
      chapterObjectives: this.createChapterObjectives(
        estimatedChapterCount,
        niche ?? genre ?? title,
      ),
      monetizationStrategy: this.createMonetizationStrategy(
        opportunityScore.recommendation,
        opportunityScore.overallScore,
      ),
      confidenceScore: this.calculateConfidence(
        project,
        knowledge,
        classification,
        opportunityScore,
      ),
      blueprintVersion: this.factory.getBlueprintVersion(),
      status: BookBlueprintStatus.GENERATED,
      metadata: {
        generationMode: 'synchronous',
        generationProvider: 'deterministic-blueprint-engine',
        generationModel: this.factory.getBlueprintVersion(),
        providerCapabilityStatus: 'READY',
        statusLifecycle: ['READY', 'RUNNING', 'COMPLETED'],
        backgroundJobExecutionId: null,
        projectCode: project.projectCode,
        marketIntelligenceSlug: marketIntelligence.slug,
        knowledgeProvider: knowledge.provider,
        classificationVersion: classification.classificationVersion,
        opportunityGrade: opportunityScore.opportunityGrade,
        recommendation: opportunityScore.recommendation,
        sourceKeywords: knowledge.keywords,
      },
    };
  }

  private createSubtitle(
    niche: string | null,
    targetAudience: string | null,
  ): string {
    const audience = targetAudience ?? 'modern readers';
    const topic = niche ?? 'your selected topic';

    return `A Practical Guide to ${topic} for ${audience}`;
  }

  private createUsp(
    niche: string | null,
    targetAudience: string | null,
    opportunityScore: number,
  ): string {
    const topic = niche ?? 'the selected topic';
    const audience = targetAudience ?? 'readers';

    return `A focused, actionable resource for ${audience} that turns ${topic} into clear, practical outcomes, supported by an opportunity score of ${opportunityScore}.`;
  }

  private createReaderPersona(
    targetAudience: string | null,
    niche: string | null,
  ): string {
    return `A motivated ${targetAudience ?? 'reader'} seeking practical guidance and measurable progress in ${niche ?? 'the selected subject area'}.`;
  }

  private resolveTone(writingStyle: string | null): string {
    if (writingStyle === 'analytical') {
      return 'Clear, evidence-based, and authoritative';
    }

    if (writingStyle === 'inspirational') {
      return 'Encouraging, motivating, and accessible';
    }

    return 'Practical, clear, and reader-focused';
  }

  private createPublishingStrategy(
    targetPlatforms: string[],
    recommendation: string,
  ): string {
    const platforms =
      targetPlatforms.length > 0
        ? targetPlatforms.join(', ')
        : 'Amazon KDP and additional digital publishing platforms';

    return `Prioritize ${platforms}. Align the launch plan with the ${recommendation} market recommendation and optimize metadata before publication.`;
  }

  private createSeoKeywords(
    title: string,
    genre: string | null,
    niche: string | null,
    microNiche: string | null,
    knowledgeKeywords: string[],
    projectTags: string[],
  ): string[] {
    const values = [
      title,
      genre,
      niche,
      microNiche,
      ...knowledgeKeywords,
      ...projectTags,
    ].filter((value): value is string => Boolean(value));

    return [...new Set(values.map((value) => value.trim().toLowerCase()))].slice(
      0,
      30,
    );
  }

  private createChapterObjectives(
    chapterCount: number,
    topic: string,
  ): string[] {
    return Array.from(
      { length: chapterCount },
      (_, index) =>
        `Chapter ${index + 1}: Deliver a practical learning outcome for ${topic}.`,
    );
  }

  private createMonetizationStrategy(
    recommendation: string,
    overallScore: number,
  ): string {
    return `Position the book as a premium practical resource. Use the ${recommendation} recommendation and opportunity score of ${overallScore} to guide pricing, format selection, and platform prioritization.`;
  }

  private calculateConfidence(
    project: BookProjectResponseDto,
    knowledge: MarketKnowledgeResponseDto,
    classification: AIClassificationResponseDto,
    opportunityScore: OpportunityScoreResponseDto,
  ): number {
    const values = [
      project.description,
      project.targetAudience,
      project.objective,
      knowledge.description,
      knowledge.category,
      knowledge.searchVolume,
      knowledge.trendScore,
      classification.primaryCategory,
      classification.niche,
      classification.confidenceScore,
      opportunityScore.overallScore,
      opportunityScore.confidenceScore,
    ];

    const populated = values.filter(
      (value) => value !== null && value !== undefined,
    ).length;

    return Math.round((populated / values.length) * 100);
  }
}
