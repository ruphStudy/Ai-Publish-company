import type { ErrorCode } from '../errors/error-codes';

export interface ApiErrorResponse {
  statusCode: number;
  errorCode: ErrorCode;
  message: string;
  path: string;
  timestamp: string;
}
