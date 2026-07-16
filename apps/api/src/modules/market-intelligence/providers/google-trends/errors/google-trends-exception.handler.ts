import { DataSourceProvider } from '../../../entities/market-intelligence.entity';
import { ProviderError, ProviderErrorCode } from '../../interfaces/provider.interface';
import { GoogleTrendsApiError } from '../interfaces/google-trends.interface';
import { GOOGLE_TRENDS_ERROR_CODE_MAP } from '../constants/google-trends.constants';

export class GoogleTrendsExceptionHandler {
  static fromApiError(error: GoogleTrendsApiError): ProviderError {
    const mappedCode = GOOGLE_TRENDS_ERROR_CODE_MAP[error.code] as ProviderErrorCode | undefined;
    const providerErrorCode = mappedCode ?? ProviderErrorCode.EXECUTION_FAILED;

    return {
      code: providerErrorCode,
      message: error.message,
      provider: DataSourceProvider.GOOGLE_TRENDS,
      retryable: GoogleTrendsExceptionHandler.isRetryable(providerErrorCode),
      details: { googleTrendsErrorCode: error.code, status: error.status },
    };
  }

  static fromHttpStatus(status: number, message: string): ProviderError {
    if (status === 401 || status === 403) {
      return {
        code: ProviderErrorCode.UNAUTHORIZED,
        message: `Google Trends authorization failed (HTTP ${status}): ${message}`,
        provider: DataSourceProvider.GOOGLE_TRENDS,
        retryable: false,
        details: { status },
      };
    }

    if (status === 429) {
      return {
        code: ProviderErrorCode.RATE_LIMITED,
        message: `Google Trends rate limit exceeded (HTTP ${status})`,
        provider: DataSourceProvider.GOOGLE_TRENDS,
        retryable: true,
        details: { status },
      };
    }

    if (status >= 500) {
      return {
        code: ProviderErrorCode.UNAVAILABLE,
        message: `Google Trends server error (HTTP ${status})`,
        provider: DataSourceProvider.GOOGLE_TRENDS,
        retryable: true,
        details: { status },
      };
    }

    return {
      code: ProviderErrorCode.EXECUTION_FAILED,
      message: `Google Trends request failed (HTTP ${status}): ${message}`,
      provider: DataSourceProvider.GOOGLE_TRENDS,
      retryable: false,
      details: { status },
    };
  }

  static fromException(error: unknown): ProviderError {
    if (error instanceof Error) {
      const code = (error as any).code as string | undefined;
      const status = (error as any).status as number | undefined;

      if (status !== undefined) {
        return GoogleTrendsExceptionHandler.fromHttpStatus(status, error.message);
      }

      if (code === 'PROVIDER_TIMEOUT' || error.message.includes('timed out')) {
        return {
          code: ProviderErrorCode.TIMEOUT,
          message: error.message,
          provider: DataSourceProvider.GOOGLE_TRENDS,
          retryable: true,
          details: { originalError: error.message },
        };
      }

      if (code === 'PROVIDER_RATE_LIMITED') {
        return {
          code: ProviderErrorCode.RATE_LIMITED,
          message: error.message,
          provider: DataSourceProvider.GOOGLE_TRENDS,
          retryable: true,
          details: { originalError: error.message },
        };
      }

      if (
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('PROVIDER_UNAVAILABLE') ||
        error.message.includes('socket hang up')
      ) {
        return {
          code: ProviderErrorCode.UNAVAILABLE,
          message: `Network error connecting to Google Trends: ${error.message}`,
          provider: DataSourceProvider.GOOGLE_TRENDS,
          retryable: true,
          details: { originalError: error.message },
        };
      }

      return {
        code: ProviderErrorCode.EXECUTION_FAILED,
        message: error.message,
        provider: DataSourceProvider.GOOGLE_TRENDS,
        retryable: false,
        details: { originalError: error.message },
      };
    }

    return {
      code: ProviderErrorCode.UNKNOWN,
      message: 'An unknown error occurred in Google Trends provider',
      provider: DataSourceProvider.GOOGLE_TRENDS,
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
