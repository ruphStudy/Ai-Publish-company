import { Injectable } from '@nestjs/common';
import { MetadataFactory } from './book-metadata.factory';
import { BookMetadataEngine } from './book-metadata.engine';
import { BookMetadataResponseParser } from './parsers/book-metadata-response.parser';
import { BookMetadataPromptBuilder } from './prompt/book-metadata-prompt.builder';
import { OpenAiMetadataProvider } from './providers/openai-metadata.provider';
import { BookMetadataRetryStrategy } from './retry/book-metadata-retry.strategy';

@Injectable()
export class BookMetadataPipeline {
  constructor(
    private readonly promptBuilder: BookMetadataPromptBuilder,
    private readonly provider: OpenAiMetadataProvider,
    private readonly retryStrategy: BookMetadataRetryStrategy,
    private readonly responseParser: BookMetadataResponseParser,
    private readonly engine: BookMetadataEngine,
    private readonly metadataFactory: MetadataFactory,
  ) {}

  async execute(
    project: Record<string, unknown>,
    blueprint: Record<string, unknown>,
    outline: Record<string, unknown>,
    contents: Record<string, unknown>[],
    generatedBy?: string,
    instruction?: string,
  ) {
    const prompt = this.promptBuilder.build(
      project,
      blueprint,
      outline,
      contents,
      instruction,
    );

    const providerResponse = await this.retryStrategy.execute(() =>
      this.provider.generate(prompt),
    );

    const generated = this.engine.normalize(
      this.responseParser.parse(providerResponse.content),
    );

    return this.metadataFactory.create(
      project,
      blueprint,
      generated,
      providerResponse,
      generatedBy,
    );
  }
}