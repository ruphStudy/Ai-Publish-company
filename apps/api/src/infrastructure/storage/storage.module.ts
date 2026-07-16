import { S3Client } from '@aws-sdk/client-s3';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const S3_CLIENT = Symbol('S3_CLIENT');

@Global()
@Module({
  providers: [
    {
      provide: S3_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        new S3Client({
          endpoint: config.getOrThrow<string>('s3.endpoint'),
          region: config.getOrThrow<string>('s3.region'),
          forcePathStyle: config.getOrThrow<boolean>('s3.forcePathStyle'),
          credentials: {
            accessKeyId: config.getOrThrow<string>('s3.accessKeyId'),
            secretAccessKey: config.getOrThrow<string>('s3.secretAccessKey'),
          },
        }),
    },
  ],
  exports: [S3_CLIENT],
})
export class StorageModule {}
