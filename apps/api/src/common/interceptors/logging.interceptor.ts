import type {
  NestInterceptor,
  ExecutionContext,
  CallHandler} from '@nestjs/common';
import {
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { redactSensitive, safeErrorStack } from '../../core/security/security-redaction';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, correlationId } = request;
    const userAgent = request.get('user-agent') || '';
    const ip = request.ip;
    const startTime = Date.now();

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      correlationId,
      userAgent,
      ip,
      body: redactSensitive(body),
    });

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const responseTime = Date.now() - startTime;

        this.logger.log({
          message: 'Outgoing response',
          method,
          url,
          correlationId,
          statusCode,
          responseTime: `${responseTime}ms`,
        });
      }),
      catchError((error: unknown) => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const responseTime = Date.now() - startTime;

        this.logger.error({
          message: 'Request failed',
          method,
          url,
          correlationId,
          statusCode,
          responseTime: `${responseTime}ms`,
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: safeErrorStack(error),
        });

        throw error;
      }),
    );
  }

}
