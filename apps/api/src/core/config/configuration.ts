import type { AppConfiguration } from '@ai-publishing/config';

const toBoolean = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined || value === '') return fallback;
  return value.toLowerCase() === 'true';
};

const parseOrigins = (value: string): string[] => {
  if (value === '*') return ['*'];
  return value.split(',').map((origin) => origin.trim());
};

const requireProductionSecret = (name: string, value: string | undefined, fallback: string): string => {
  if (process.env.NODE_ENV === 'production' && (!value || value === fallback || value.length < 32)) {
    throw new Error(`${name} must be configured with a strong production value`);
  }
  return value ?? fallback;
};

const productionOrigins = (origins: string[]): string[] => {
  if (process.env.NODE_ENV === 'production' && origins.includes('*')) {
    throw new Error('CORS_ORIGINS must not be wildcard in production');
  }
  return origins;
};

export const configuration = (): AppConfiguration => ({
  nodeEnv: (process.env.NODE_ENV as AppConfiguration['nodeEnv']) ?? 'development',
  logLevel: (process.env.LOG_LEVEL as AppConfiguration['logLevel']) ?? 'info',
  api: {
    port: Number(process.env.API_PORT ?? 3000),
  },
  jwt: {
    secret: requireProductionSecret('JWT_SECRET', process.env.JWT_SECRET, 'change-me-with-at-least-32-chars'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    refreshSecret: requireProductionSecret('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, 'change-me-refresh-with-at-least-32-chars'),
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  },
  mongo: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/ai_publishing',
    maxPoolSize: Number(process.env.MONGODB_MAX_POOL_SIZE ?? 10),
    minPoolSize: Number(process.env.MONGODB_MIN_POOL_SIZE ?? 2),
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB ?? 0),
    ttl: Number(process.env.REDIS_TTL ?? 3600),
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
    region: process.env.S3_REGION ?? 'us-east-1',
    bucket: process.env.S3_BUCKET ?? 'ai-publishing-assets',
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? 'minioadmin',
    forcePathStyle: toBoolean(process.env.S3_FORCE_PATH_STYLE, true),
  },
  cors: {
    origins: productionOrigins(parseOrigins(process.env.CORS_ORIGINS ?? '*')),
  },
  rateLimit: {
    ttl: Number(process.env.RATE_LIMIT_TTL ?? 60000),
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
  },
  swagger: {
    enabled: toBoolean(process.env.SWAGGER_ENABLED, process.env.NODE_ENV !== 'production'),
  },
  security: {
    bodyLimit: process.env.REQUEST_BODY_LIMIT ?? '1mb',
  },
});
