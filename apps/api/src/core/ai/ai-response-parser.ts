import { Injectable } from '@nestjs/common';
import { AiTokenUsage } from './ai-provider.interface';

@Injectable()
export class AiResponseParser {
  extractContent(payload: Record<string, unknown>): string | null {
    if (typeof payload.output_text === 'string') return payload.output_text;
    if (!Array.isArray(payload.output)) return null;

    const parts = payload.output.flatMap((output) => {
      if (!output || typeof output !== 'object') return [];
      const content = (output as { content?: unknown }).content;
      return Array.isArray(content) ? content : [];
    });

    return parts
      .filter((part): part is { type: string; text: string } =>
        Boolean(part && typeof part === 'object' &&
          (part as { type?: unknown }).type === 'output_text' &&
          typeof (part as { text?: unknown }).text === 'string'))
      .map((part) => part.text)
      .join('\n')
      .trim() || null;
  }

  extractUsage(payload: Record<string, unknown>): AiTokenUsage {
    const usage = payload.usage && typeof payload.usage === 'object'
      ? payload.usage as Record<string, unknown>
      : {};
    const promptTokens = this.number(usage.input_tokens ?? usage.prompt_tokens);
    const completionTokens = this.number(usage.output_tokens ?? usage.completion_tokens);
    const reportedTotal = this.number(usage.total_tokens);
    return {
      promptTokens,
      completionTokens,
      totalTokens: reportedTotal || promptTokens + completionTokens,
    };
  }

  extractError(payload: Record<string, unknown>): string | null {
    const error = payload.error;
    if (!error || typeof error !== 'object') return null;
    const message = (error as { message?: unknown }).message;
    return typeof message === 'string' ? message : null;
  }

  private number(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}
