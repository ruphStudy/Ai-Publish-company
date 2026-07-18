export const bookMetadataConfig = {
  provider: process.env.BOOK_METADATA_PROVIDER ?? 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    model: process.env.OPENAI_METADATA_MODEL ?? 'gpt-5',
    timeoutMs: Number(process.env.BOOK_METADATA_TIMEOUT_MS ?? 90000),
  },
  retry: {
    maxRetries: Number(process.env.BOOK_METADATA_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.BOOK_METADATA_RETRY_DELAY_MS ?? 1000),
  },
  generation: {
    promptVersion: process.env.BOOK_METADATA_PROMPT_VERSION ?? 'v1',
    metadataVersion: process.env.BOOK_METADATA_VERSION ?? 'v1',
  },
};