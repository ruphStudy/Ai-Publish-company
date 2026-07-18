export interface AppConfiguration {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  logLevel: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
  api: {
    port: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
  };
  mongo: {
    uri: string;
    maxPoolSize: number;
    minPoolSize: number;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
    ttl: number;
  };
  s3: {
    endpoint: string;
    region: string;
    bucket: string;
    accessKeyId: string;
    secretAccessKey: string;
    forcePathStyle: boolean;
  };
  cors: {
    origins: string[];
  };
  rateLimit: {
    ttl: number;
    max: number;
  };
  swagger: {
    enabled: boolean;
  };
  security: {
    bodyLimit: string;
  };
}
