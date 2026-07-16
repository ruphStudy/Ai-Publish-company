export const MARKET_INTELLIGENCE_QUEUE = 'market-intelligence';

export const SCHEDULER_JOB_NAMES = {
  AMAZON_KDP_COLLECTION: 'amazon-kdp-collection',
  GOOGLE_TRENDS_COLLECTION: 'google-trends-collection',
  GOOGLE_BOOKS_COLLECTION: 'google-books-collection',
  OPEN_LIBRARY_COLLECTION: 'open-library-collection',
} as const;

export type SchedulerJobName = (typeof SCHEDULER_JOB_NAMES)[keyof typeof SCHEDULER_JOB_NAMES];

export const SCHEDULER_JOB_QUEUE_EVENTS = {
  COLLECT: 'collect',
  NORMALIZE: 'normalize',
  SCORE: 'score',
  STORE: 'store',
} as const;
