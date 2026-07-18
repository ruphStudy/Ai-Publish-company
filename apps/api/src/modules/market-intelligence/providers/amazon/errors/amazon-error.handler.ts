import { DataSourceProvider } from '../../../entities/market-intelligence.entity';
import type { ProviderError} from '../../interfaces/provider.interface';
import { ProviderErrorCode } from '../../interfaces/provider.interface';
import type { AmazonApiError, AmazonHttpError } from '../interfaces/amazon.interface';
import { AMAZON_ERROR_CODE_MAP } from '../constants/amazon.constants';

export class AmazonProviderExceptionHandler {
  static fromApiErrors(errors: AmazonApiError[]): ProviderError {
    const first = errors[0] ?? {};
    const code = first.Code ?? '';
    const message = first.Message ?? 'Amazon API returned errors';
    const mappedCode = AMAZON_ERROR_CODE_MAP[code] as ProviderErrorCode | undefined;

    const providerErrorCode = mappedCode ?? ProviderErrorCode.EXECUTION_FAILED;
    const retryable = AmazonProviderExceptionHandler.isRetryable(providerErrorCode);

    return {
      code: providerErrorCode,
      message,
      provider: DataSourceProvider.AMAZON_KDP,
      retryable,
      details: { amazonErrorCode: code, errors },
    };
  }

  static fromHttpError(error: AmazonHttpError): ProviderError {
    const { statusCode, responseBody } = error;

    if (statusCode === 401 || statusCode === 403) {
      return {
        code: ProviderErrorCode.UNAUTHORIZED,
        message: `Amazon PA-API authorization failed (HTTP ${statusCode})`,
        provider: DataSourceProvider.AMAZON_KDP,
        retryable: false,
        details: { statusCode },
      };
    }

    if (statusCode === 429) {
      return {
        code: ProviderErrorCode.RATE_LIMITED,
        message: `Amazon PA-API rate limit exceeded (HTTP ${statusCode})`,
        provider: DataSourceProvider.AMAZON_KDP,
        retryable: true,
        details: { statusCode },
      };
    }

    if (statusCode >= 500) {
      return {
        code: ProviderErrorCode.UNAVAILABLE,
        message: `Amazon PA-API server error (HTTP ${statusCode})`,
        provider: DataSourceProvider.AMAZON_KDP,
        retryable: true,
        details: { statusCode },
      };
    }

    const body = responseBody as {
      Errors?: AmazonApiError[];
      SearchResult?: { Errors?: AmazonApiError[] };
    };
    const bodyErrors =
      body.Errors ??
      body.SearchResult?.Errors ??
      [];

    if (Array.isArray(bodyErrors) && bodyErrors.length > 0) {
      return AmazonProviderExceptionHandler.fromApiErrors(bodyErrors as AmazonApiError[]);
    }

    return {
      code: ProviderErrorCode.EXECUTION_FAILED,
      message: `Amazon PA-API request failed (HTTP ${statusCode})`,
      provider: DataSourceProvider.AMAZON_KDP,
      retryable: statusCode >= 500,
      details: { statusCode },
    };
  }

  static fromException(error: unknown): ProviderError {
    if (error instanceof Error) {
      const details = error as Error & {
        code?: string;
        statusCode?: number;
        responseBody?: object;
      };
      const { code, statusCode, responseBody } = details;

      if (statusCode !== undefined) {
        return AmazonProviderExceptionHandler.fromHttpError({
          statusCode,
          responseBody: responseBody ?? {},
        });
      }

      if (code === ProviderErrorCode.TIMEOUT || error.message.includes('timed out')) {
        return {
          code: ProviderErrorCode.TIMEOUT,
          message: error.message,
          provider: DataSourceProvider.AMAZON_KDP,
          retryable: true,
          details: { originalError: error.message },
        };
      }

      if (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('socket hang up')
      ) {
        return {
          code: ProviderErrorCode.UNAVAILABLE,
          message: `Network error connecting to Amazon PA-API: ${error.message}`,
          provider: DataSourceProvider.AMAZON_KDP,
          retryable: true,
          details: { originalError: error.message },
        };
      }

      return {
        code: ProviderErrorCode.EXECUTION_FAILED,
        message: error.message,
        provider: DataSourceProvider.AMAZON_KDP,
        retryable: false,
        details: { originalError: error.message },
      };
    }

    return {
      code: ProviderErrorCode.UNKNOWN,
      message: 'An unknown error occurred in Amazon provider',
      provider: DataSourceProvider.AMAZON_KDP,
      retryable: false,
      details: { error: String(error) },
    };
  }

  private static isRetryable(code: ProviderErrorCode): boolean {
    return (
      code === ProviderErrorCode.RATE_LIMITED ||
      code === ProviderErrorCode.TIMEOUT ||
      code === ProviderErrorCode.UNAVAILABLE
    );
  }
}

export { AmazonProviderExceptionHandler as AmazonErrorHandler };
