import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';
import type { AppConfiguration } from '@ai-publishing/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService<AppConfiguration, true>) {}

  get nodeEnv(): AppConfiguration['nodeEnv'] {
    return this.configService.get('nodeEnv', { infer: true });
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get logLevel(): string {
    return this.configService.get('logLevel', { infer: true });
  }

  get apiPort(): number {
    return this.configService.get('api.port', { infer: true });
  }

  get jwtSecret(): string {
    return this.configService.get('jwt.secret', { infer: true });
  }

  get jwtExpiresIn(): string {
    return this.configService.get('jwt.expiresIn', { infer: true });
  }

  get jwtRefreshSecret(): string {
    return this.configService.get('jwt.refreshSecret', { infer: true });
  }

  get jwtRefreshExpiresIn(): string {
    return this.configService.get('jwt.refreshExpiresIn', { infer: true });
  }

  get mongoUri(): string {
    return this.configService.get('mongo.uri', { infer: true });
  }

  get redisHost(): string {
    return this.configService.get('redis.host', { infer: true });
  }

  get redisPort(): number {
    return this.configService.get('redis.port', { infer: true });
  }

  get redisPassword(): string | undefined {
    return this.configService.get('redis.password', { infer: true });
  }

  get s3Config(): AppConfiguration['s3'] {
    return {
      endpoint: this.configService.get('s3.endpoint', { infer: true }),
      region: this.configService.get('s3.region', { infer: true }),
      bucket: this.configService.get('s3.bucket', { infer: true }),
      accessKeyId: this.configService.get('s3.accessKeyId', { infer: true }),
      secretAccessKey: this.configService.get('s3.secretAccessKey', { infer: true }),
      forcePathStyle: this.configService.get('s3.forcePathStyle', { infer: true }),
    };
  }

  get corsOrigins(): string[] {
    return this.configService.get('cors.origins', { infer: true });
  }

  get swaggerEnabled(): boolean {
    return this.configService.get('swagger.enabled', { infer: true });
  }

}
