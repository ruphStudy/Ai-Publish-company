export const aiWritingConfig = {
  provider: process.env.AI_WRITING_PROVIDER ?? 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    model: process.env.OPENAI_WRITING_MODEL ?? 'gpt-5',
    timeoutMs: Number(process.env.AI_WRITING_TIMEOUT_MS ?? 120000),
    inputCostPerMillionTokens: Number(
      process.env.OPENAI_INPUT_COST_PER_MILLION_TOKENS ?? 1.25,
    ),
    outputCostPerMillionTokens: Number(
      process.env.OPENAI_OUTPUT_COST_PER_MILLION_TOKENS ?? 10,
    ),
  },
  retry: {
    maxRetries: Number(process.env.AI_WRITING_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.AI_WRITING_RETRY_DELAY_MS ?? 1000),
  },
  generation: {
    promptVersion: process.env.AI_WRITING_PROMPT_VERSION ?? 'v1',
    contentVersion: process.env.AI_WRITING_CONTENT_VERSION ?? 'v1',
    readingWordsPerMinute: Number(
      process.env.AI_WRITING_READING_WORDS_PER_MINUTE ?? 220,
    ),
  },
};