import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: any, context?: string): void {
    this.logger.info({ context }, message);
  }

  error(message: any, trace?: string, context?: string): void {
    this.logger.error({ context, trace }, message);
  }

  warn(message: any, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: any, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: any, context?: string): void {
    this.logger.trace({ context }, message);
  }

  logRequest(method: string, url: string, correlationId: string, data?: any): void {
    this.logger.info({
      type: 'request',
      method,
      url,
      correlationId,
      ...data,
    });
  }

  logResponse(method: string, url: string, statusCode: number, correlationId: string, responseTime: number): void {
    this.logger.info({
      type: 'response',
      method,
      url,
      statusCode,
      correlationId,
      responseTime: `${responseTime}ms`,
    });
  }

  logError(error: Error, correlationId?: string, context?: any): void {
    this.logger.error({
      type: 'error',
      message: error.message,
      stack: error.stack,
      correlationId,
      ...context,
    });
  }
}
