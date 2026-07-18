import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { performanceGuardrails } from './performance.config';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const started = performance.now();

    return next.handle().pipe(tap(() => {
      const durationMs = Math.round(performance.now() - started);
      response.setHeader('x-response-time-ms', String(durationMs));
      if (durationMs >= performanceGuardrails.request.slowMs) {
        this.logger.warn({ message: 'Slow API request', method: request.method, url: request.url, durationMs, correlationId: request.correlationId });
      }
    }));
  }
}
