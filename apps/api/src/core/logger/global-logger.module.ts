import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { IncomingMessage } from 'http';
import { AppLoggerService } from './logger.service';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('logLevel', 'info'),
          transport:
            config.get<string>('nodeEnv') === 'development'
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    singleLine: false,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                }
              : config.get<string>('nodeEnv') === 'production'
                ? {
                    target: 'pino-roll',
                    options: {
                      file: 'logs/app',
                      frequency: 'daily',
                      size: '10m',
                      mkdir: true,
                    },
                  }
                : undefined,
          formatters: {
            level: (label: string) => ({ level: label }),
          },
          redact: {
            paths: [
              'req.headers.authorization',
              'req.headers.cookie',
              'req.body.password',
              'req.body.refreshToken',
            ],
            remove: true,
          },
          customProps: (req: IncomingMessage) => ({
            correlationId: (req as any).correlationId || randomUUID(),
          }),
          serializers: {
            req: (req: any) => ({
              id: req.id,
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
              correlationId: req.raw?.correlationId,
              ip: req.headers['x-forwarded-for'] || req.remoteAddress,
              userAgent: req.headers['user-agent'],
            }),
            res: (res: any) => ({
              statusCode: res.statusCode,
              responseTime: res.responseTime,
            }),
            err: (err: any) => ({
              type: err.type,
              message: err.message,
              stack: err.stack,
              code: err.code,
              statusCode: err.statusCode,
            }),
          },
          autoLogging: {
            ignore: (req: IncomingMessage) => req.url === '/api/v1/health',
          },
          customSuccessMessage: (req: any, res: any) => {
            return `${req.method} ${req.url} ${res.statusCode} - ${res.responseTime}ms`;
          },
          customErrorMessage: (req: any, res: any, err: Error) => {
            return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
          },
        },
      }),
    }),
  ],
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class GlobalLoggerModule {}
