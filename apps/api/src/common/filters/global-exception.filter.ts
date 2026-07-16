import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { ERROR_CODES } from '@ai-publishing/shared';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const correlationId = (request as any).correlationId;

    const errorResponse = {
      statusCode: status,
      errorCode: isHttpException ? ERROR_CODES.VALIDATION_ERROR : ERROR_CODES.INTERNAL_ERROR,
      message: isHttpException ? exception.message : 'Internal server error',
      path: request.url,
      timestamp: new Date().toISOString(),
      correlationId,
    };

    this.logger.error({
      message: 'Exception caught',
      error: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      correlationId,
      method: request.method,
      url: request.url,
      statusCode: status,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    response.status(status).json(errorResponse);
  }
}
