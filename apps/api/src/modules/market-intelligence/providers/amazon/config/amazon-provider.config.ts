export interface AmazonProviderConfig {
  accessKey: string;
  secretKey: string;
  partnerTag: string;
  host: string;
  region: string;
  marketplace: string;
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  useMock: boolean;
}

export function loadAmazonProviderConfig(): AmazonProviderConfig {
  return {
    accessKey: process.env.AMAZON_PAAPI_ACCESS_KEY ?? '',
    secretKey: process.env.AMAZON_PAAPI_SECRET_KEY ?? '',
    partnerTag: process.env.AMAZON_PAAPI_PARTNER_TAG ?? '',
    host: process.env.AMAZON_PAAPI_HOST ?? 'webservices.amazon.com',
    region: process.env.AMAZON_PAAPI_REGION ?? 'us-east-1',
    marketplace: process.env.AMAZON_PAAPI_MARKETPLACE ?? 'www.amazon.com',
    timeoutMs: Number(process.env.AMAZON_PAAPI_TIMEOUT_MS ?? 30000),
    maxRetries: Number(process.env.AMAZON_PAAPI_MAX_RETRIES ?? 3),
    retryDelayMs: Number(process.env.AMAZON_PAAPI_RETRY_DELAY_MS ?? 5000),
    useMock: (process.env.AMAZON_PAAPI_USE_MOCK ?? 'true') !== 'false',
  };
}

export function isAmazonConfigValid(config: AmazonProviderConfig): boolean {
  if (config.useMock) return true;
  return (
    config.accessKey.length > 0 &&
    config.secretKey.length > 0 &&
    config.partnerTag.length > 0
  );
}

export type AmazonProviderRawConfig = AmazonProviderConfig;
