import type { LoggerService as NestLoggerService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { redactSensitive, safeErrorStack } from '../security/security-redaction';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: unknown, context?: string): void {
    this.logger.info({ context, message: redactSensitive(message) });
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.logger.error({ context, trace: process.env.NODE_ENV === 'production' ? undefined : trace, message: redactSensitive(message) });
  }

  warn(message: unknown, context?: string): void {
    this.logger.warn({ context, message: redactSensitive(message) });
  }

  debug(message: unknown, context?: string): void {
    this.logger.debug({ context, message });
  }

  verbose(message: unknown, context?: string): void {
    this.logger.trace({ context, message });
  }

  logRequest(method: string, url: string, correlationId: string, data: Record<string, unknown> = {}): void {
    this.logger.info({
      type: 'request',
      method,
      url,
      correlationId,
      ...redactSensitive(data),
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

  logError(error: Error, correlationId?: string, context: Record<string, unknown> = {}): void {
    this.logger.error({
      type: 'error',
      message: error.message,
      stack: safeErrorStack(error),
      correlationId,
      ...redactSensitive(context),
    });
  }
}
