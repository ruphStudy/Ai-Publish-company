import { Inject, Injectable } from '@nestjs/common';
import { AiOutlineProvider } from './interfaces/ai-outline-provider.interface';
import { AI_OUTLINE_PROVIDER } from './interfaces/ai-outline-provider.interface';
import { OutlineFactory } from './outline.factory';
import { OutlineGenerationEngine } from './outline-generation.engine';
import { OutlineResponseParser } from './parsers/outline-response.parser';
import { OutlinePromptBuilder } from './prompt/outline-prompt.builder';
import { OutlineRetryStrategy } from './retry/outline-retry.strategy';

@Injectable()
export class OutlineGenerationPipeline {
  constructor(
    private readonly promptBuilder: OutlinePromptBuilder,
    @Inject(AI_OUTLINE_PROVIDER)
    private readonly provider: AiOutlineProvider,
    private readonly retryStrategy: OutlineRetryStrategy,
    private readonly responseParser: OutlineResponseParser,
    private readonly generationEngine: OutlineGenerationEngine,
    private readonly outlineFactory: OutlineFactory,
  ) {}

  async execute(
    blueprint: Record<string, unknown>,
    generatedBy?: string,
  ) {
    const prompt = this.promptBuilder.build(blueprint);

    const providerResponse = await this.retryStrategy.execute(() =>
      this.provider.generate({ prompt }),
    );

    const parsed = this.responseParser.parse(providerResponse.content);
    const normalized = this.generationEngine.normalize(parsed);

    return this.outlineFactory.create(
      blueprint,
      normalized,
      providerResponse.provider,
      providerResponse.model,
      generatedBy,
    );
  }
}
