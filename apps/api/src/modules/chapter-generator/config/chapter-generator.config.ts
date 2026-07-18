export const chapterGeneratorConfig = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL ?? 'gpt-5',
    timeoutMs: Number(process.env.CHAPTER_OPENAI_TIMEOUT_MS ?? 60000),
  },
  retry: {
    maxRetries: Number(process.env.CHAPTER_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.CHAPTER_RETRY_DELAY_MS ?? 1000),
  },
  generation: {
    promptVersion: process.env.CHAPTER_PROMPT_VERSION ?? 'v1',
    chapterVersion: process.env.CHAPTER_VERSION ?? 'v1',
    readingWordsPerMinute: Number(
      process.env.CHAPTER_READING_WORDS_PER_MINUTE ?? 220,
    ),
  },
};