import { Injectable } from '@nestjs/common';
import { OpenAiClientService } from './openai-client.service';

@Injectable()
export class AiProviderFactory {
  constructor(private readonly openAi: OpenAiClientService) {}
  getOpenAi(): OpenAiClientService { return this.openAi; }
}
