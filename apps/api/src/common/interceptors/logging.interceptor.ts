import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
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
      body: this.sanitizeBody(body),
    });

    return next.handle().pipe(
      tap((data) => {
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
      catchError((error) => {
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
          error: error.message,
          stack: error.stack,
        });

        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }
    
    return sanitized;
  }
}
