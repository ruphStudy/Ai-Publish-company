import { DataSourceProvider, MarketDataType } from '../../entities/market-intelligence.entity';
import { DataSourceParams } from '../../interfaces/data-source.interface';
import {
  IProvider,
  ProviderConfig,
  ProviderResponse,
  ProviderHealthResult,
  ProviderError,
  ProviderErrorCode,
  ProviderStatus,
  ProviderCapability,
  ValidationResult,
} from '../interfaces/provider.interface';

export abstract class BaseProvider implements IProvider {
  abstract readonly key: string;
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly provider: DataSourceProvider;

  readonly priority: number = 5;
  readonly capabilities: ProviderCapability[] = [];

  abstract supports(dataType: MarketDataType): boolean;
  abstract isAvailable(): Promise<boolean>;

  async validate(params: DataSourceParams): Promise<ValidationResult> {
    const errors: string[] = [];

    if (!params.provider) {
      errors.push('provider is required');
    }

    if (params.provider && params.provider !== this.provider) {
      errors.push(`provider mismatch: expected "${this.provider}", received "${params.provider}"`);
    }

    if (params.dataType && !this.supports(params.dataType)) {
      errors.push(`dataType "${params.dataType}" is not supported by provider "${this.key}"`);
    }

    const customErrors = await this.validateParams(params);
    errors.push(...customErrors);

    return { valid: errors.length === 0, errors };
  }

  async execute(params: DataSourceParams, config: ProviderConfig): Promise<ProviderResponse> {
    const startedAt = Date.now();

    const validation = await this.validate(params);
    if (!validation.valid) {
      return this.buildErrorResponse(
        {
          code: ProviderErrorCode.VALIDATION_FAILED,
          message: `Validation failed: ${validation.errors.join(', ')}`,
          provider: this.provider,
          retryable: false,
          details: { errors: validation.errors },
        },
        startedAt,
      );
    }

    const available = await this.isAvailable();
    if (!available) {
      return this.buildErrorResponse(
        {
          code: ProviderErrorCode.UNAVAILABLE,
          message: `Provider "${this.key}" is currently unavailable`,
          provider: this.provider,
          retryable: true,
        },
        startedAt,
      );
    }

    try {
      const timeoutMs = config.timeoutMs ?? 30000;

      const result = await Promise.race([
        this.executeInternal(params, config),
        this.buildTimeoutPromise<ProviderResponse>(timeoutMs),
      ]);

      return result;
    } catch (error) {
      const providerError = this.normalizeError(error);
      return this.buildErrorResponse(providerError, startedAt);
    }
  }

  async healthCheck(): Promise<ProviderHealthResult> {
    const startedAt = Date.now();
    try {
      const available = await this.isAvailable();
      const latencyMs = Date.now() - startedAt;

      return {
        key: this.key,
        provider: this.provider,
        version: this.version,
        isAvailable: available,
        status: available ? ProviderStatus.ACTIVE : ProviderStatus.INACTIVE,
        latencyMs,
        checkedAt: new Date(),
        error: null,
        metadata: { capabilities: this.capabilities.length },
      };
    } catch (error) {
      return {
        key: this.key,
        provider: this.provider,
        version: this.version,
        isAvailable: false,
        status: ProviderStatus.ERROR,
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {},
      };
    }
  }

  protected abstract executeInternal(
    params: DataSourceParams,
    config: ProviderConfig,
  ): Promise<ProviderResponse>;

  protected async validateParams(_params: DataSourceParams): Promise<string[]> {
    return [];
  }

  protected buildSuccessResponse(
    data: Record<string, unknown>,
    rawData: Record<string, unknown>,
    startedAt: number,
    metadata: Record<string, unknown> = {},
  ): ProviderResponse {
    return {
      success: true,
      provider: this.provider,
      key: this.key,
      version: this.version,
      fetchedAt: new Date(),
      durationMs: Date.now() - startedAt,
      data,
      rawData,
      metadata,
      error: null,
    };
  }

  protected buildErrorResponse(error: ProviderError, startedAt: number): ProviderResponse {
    return {
      success: false,
      provider: this.provider,
      key: this.key,
      version: this.version,
      fetchedAt: new Date(),
      durationMs: Date.now() - startedAt,
      data: null,
      rawData: null,
      metadata: {},
      error,
    };
  }

  private buildTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            Object.assign(new Error(`Provider "${this.key}" timed out after ${timeoutMs}ms`), {
              code: ProviderErrorCode.TIMEOUT,
            }),
          ),
        timeoutMs,
      ),
    );
  }

  private normalizeError(error: unknown): ProviderError {
    if (error instanceof Error) {
      const code = (error as any).code;
      const isTimeout = code === ProviderErrorCode.TIMEOUT;
      const isRateLimit = code === ProviderErrorCode.RATE_LIMITED;

      return {
        code: code ?? ProviderErrorCode.EXECUTION_FAILED,
        message: error.message,
        provider: this.provider,
        retryable: isTimeout || isRateLimit,
        details: { originalError: error.message },
      };
    }

    return {
      code: ProviderErrorCode.UNKNOWN,
      message: 'An unknown error occurred',
      provider: this.provider,
      retryable: false,
    };
  }
}
