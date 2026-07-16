export const GOOGLE_TRENDS_PROVIDER_KEY = 'google-trends-v1';
export const GOOGLE_TRENDS_PROVIDER_VERSION = '1.0.0';
export const GOOGLE_TRENDS_PROVIDER_NAME = 'Google Trends Intelligence';

export const GOOGLE_TRENDS_CONFIG_TOKEN = 'GOOGLE_TRENDS_PROVIDER_CONFIG';
export const GOOGLE_TRENDS_ADAPTER_TOKEN = 'GOOGLE_TRENDS_PROVIDER_ADAPTER';
export const MOCK_DELAY_MS = 60;

export const GOOGLE_TRENDS_QUERY_TYPE = {
  KEYWORD_TREND: 'keywordTrend',
  INTEREST_OVER_TIME: 'interestOverTime',
  RELATED_TOPICS: 'relatedTopics',
  RELATED_QUERIES: 'relatedQueries',
  TRENDING_SEARCHES: 'trendingSearches',
  GEOGRAPHIC_INTEREST: 'geographicInterest',
  RISING_QUERIES: 'risingQueries',
} as const;

export type GoogleTrendsQueryType =
  (typeof GOOGLE_TRENDS_QUERY_TYPE)[keyof typeof GOOGLE_TRENDS_QUERY_TYPE];

export const GOOGLE_TRENDS_TIME_RANGE = {
  PAST_HOUR: 'now 1-H',
  PAST_4_HOURS: 'now 4-H',
  PAST_DAY: 'now 1-d',
  PAST_7_DAYS: 'now 7-d',
  PAST_30_DAYS: 'today 1-m',
  PAST_90_DAYS: 'today 3-m',
  PAST_12_MONTHS: 'today 12-m',
  PAST_5_YEARS: 'today 5-y',
  ALL_TIME: 'all',
} as const;

export type GoogleTrendsTimeRange =
  (typeof GOOGLE_TRENDS_TIME_RANGE)[keyof typeof GOOGLE_TRENDS_TIME_RANGE];

export const GOOGLE_TRENDS_CATEGORY = {
  ALL: 0,
  ARTS_ENTERTAINMENT: 3,
  BOOKS_LITERATURE: 22,
  EDUCATION: 174,
  BUSINESS: 12,
  SCIENCE: 174,
} as const;

export const GOOGLE_TRENDS_GEO = {
  WORLDWIDE: '',
  US: 'US',
  GB: 'GB',
  CA: 'CA',
  AU: 'AU',
  IN: 'IN',
  DE: 'DE',
  FR: 'FR',
} as const;

export const TREND_DIRECTION = {
  RISING: 'rising',
  STABLE: 'stable',
  DECLINING: 'declining',
} as const;

export type TrendDirection = (typeof TREND_DIRECTION)[keyof typeof TREND_DIRECTION];

export const GOOGLE_TRENDS_ERROR_CODE_MAP: Record<string, string> = {
  RATE_LIMIT: 'PROVIDER_RATE_LIMITED',
  QUOTA_EXCEEDED: 'PROVIDER_RATE_LIMITED',
  FORBIDDEN: 'PROVIDER_UNAUTHORIZED',
  UNAUTHORIZED: 'PROVIDER_UNAUTHORIZED',
  NOT_FOUND: 'PROVIDER_EXECUTION_FAILED',
  SERVER_ERROR: 'PROVIDER_UNAVAILABLE',
  TIMEOUT: 'PROVIDER_TIMEOUT',
};
