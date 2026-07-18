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
              'req.headers.set-cookie',
              'req.headers.x-api-key',
              'req.body.password',
              'req.body.token',
              'req.body.accessToken',
              'req.body.refreshToken',
              'req.body.secret',
              'req.body.apiKey',
              'req.body.clientSecret',
              'req.body.credentials',
              'res.headers.set-cookie',
            ],
            remove: true,
          },
          customProps: (req: IncomingMessage) => ({
            correlationId: (req as IncomingMessage & { correlationId?: string }).correlationId ?? randomUUID(),
          }),
          serializers: {
            req: (req) => ({
              id: req.id,
              method: req.method,
              url: req.url,
              query: req.query,
              params: req.params,
              correlationId: req.raw?.correlationId,
              ip: req.headers['x-forwarded-for'] || req.remoteAddress,
              userAgent: req.headers['user-agent'],
            }),
            res: (res) => ({
              statusCode: res.statusCode,
              responseTime: res.responseTime,
            }),
            err: (err) => ({
              type: err.type,
              message: err.message,
              stack: config.get<string>('nodeEnv') === 'production' ? undefined : err.stack,
              code: err.code,
              statusCode: err.statusCode,
            }),
          },
          autoLogging: {
            ignore: (req: IncomingMessage) => req.url === '/api/v1/health',
          },
          customSuccessMessage: (req, res, responseTime) => {
            return `${req.method} ${req.url} ${res.statusCode} - ${responseTime}ms`;
          },
          customErrorMessage: (req, res, err) => {
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
