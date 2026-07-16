export interface GoogleTrendsProviderConfig {
  apiKey: string;
  host: string;
  geo: string;
  language: string;
  category: number;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  useMock: boolean;
}

export function loadGoogleTrendsProviderConfig(): GoogleTrendsProviderConfig {
  return {
    apiKey: process.env.GOOGLE_TRENDS_API_KEY ?? '',
    host: process.env.GOOGLE_TRENDS_HOST ?? 'trends.google.com',
    geo: process.env.GOOGLE_TRENDS_GEO ?? '',
    language: process.env.GOOGLE_TRENDS_LANGUAGE ?? 'en-US',
    category: Number(process.env.GOOGLE_TRENDS_CATEGORY ?? 0),
    timeoutMs: Number(process.env.GOOGLE_TRENDS_TIMEOUT_MS ?? 30000),
    maxRetries: Number(process.env.GOOGLE_TRENDS_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.GOOGLE_TRENDS_RETRY_DELAY_MS ?? 5000),
    useMock: (process.env.GOOGLE_TRENDS_USE_MOCK ?? 'true') !== 'false',
  };
}

export function isGoogleTrendsConfigValid(config: GoogleTrendsProviderConfig): boolean {
  if (config.useMock) return true;
  return config.apiKey.length > 0;
}
