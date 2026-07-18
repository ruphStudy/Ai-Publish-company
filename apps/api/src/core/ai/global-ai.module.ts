import { Global, Module } from '@nestjs/common';
import { AiProviderFactory } from './ai-provider.factory';
import { AiResponseParser } from './ai-response-parser';
import { OpenAiClientService } from './openai-client.service';

@Global()
@Module({
  providers: [AiResponseParser, OpenAiClientService, AiProviderFactory],
  exports: [AiResponseParser, OpenAiClientService, AiProviderFactory],
})
export class GlobalAiModule {}
