export const outlineConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL ?? 'gpt-5',
    timeoutMs: Number(process.env.OUTLINE_OPENAI_TIMEOUT_MS ?? 60000),
  },
  retry: {
    maxRetries: Number(process.env.OUTLINE_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.OUTLINE_RETRY_DELAY_MS ?? 1000),
  },
  generation: {
    promptVersion: process.env.OUTLINE_PROMPT_VERSION ?? 'v1',
    outlineVersion: process.env.OUTLINE_VERSION ?? 'v1',
    readingWordsPerMinute: Number(
      process.env.OUTLINE_READING_WORDS_PER_MINUTE ?? 220,
    ),
  },
};