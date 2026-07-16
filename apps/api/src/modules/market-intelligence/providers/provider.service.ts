import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { ProviderRepository } from './provider.repository';
import { ProviderRegistryService } from './registry/provider-registry.service';
import { ProviderHealthService } from './health/provider-health.service';
import { ProviderRegistration } from './entities/provider-registration.entity';
import {
  CreateProviderRegistrationDto,
  UpdateProviderRegistrationDto,
  ProviderQueryDto,
  ProviderRegistrationResponseDto,
  PaginatedProviderResponseDto,
  ProviderHealthSummaryResponseDto,
  ProviderValidationResponseDto,
} from './dto';
import { ProviderHealthResult } from './interfaces/provider.interface';
import { DataSourceParams } from '../interfaces/data-source.interface';

@Injectable()
export class ProviderService {
  constructor(
    private readonly repository: ProviderRepository,
    private readonly registry: ProviderRegistryService,
    private readonly healthService: ProviderHealthService,
  ) {}

  private toResponseDto(reg: ProviderRegistration): ProviderRegistrationResponseDto {
    return {
      id: (reg._id as Types.ObjectId).toString(),
      key: reg.key,
      name: reg.name,
      version: reg.version,
      provider: reg.provider,
      status: reg.status,
      priority: reg.priority,
      isEnabled: reg.isEnabled,
      timeoutMs: reg.timeoutMs,
      maxRetries: reg.maxRetries,
      retryDelayMs: reg.retryDelayMs,
      rateLimitRpm: reg.rateLimitRpm ?? null,
      rateLimitRpd: reg.rateLimitRpd ?? null,
      customConfig: reg.customConfig ?? {},
      lastHealthCheckAt: reg.lastHealthCheckAt ?? null,
      lastHealthStatus: reg.lastHealthStatus ?? null,
      lastHealthLatencyMs: reg.lastHealthLatencyMs ?? null,
      lastHealthError: reg.lastHealthError ?? null,
      createdAt: reg.createdAt,
      updatedAt: reg.updatedAt,
    };
  }

  async registerProvider(dto: CreateProviderRegistrationDto, userId: string): Promise<ProviderRegistrationResponseDto> {
    const exists = await this.repository.existsByKey(dto.key);
    if (exists) {
      throw new ConflictException(`Provider with key "${dto.key}" is already registered`);
    }

    const reg = await this.repository.create(
      {
        ...dto,
        isEnabled: dto.isEnabled ?? false,
        priority: dto.priority ?? 5,
        timeoutMs: dto.timeoutMs ?? 30000,
        maxRetries: dto.maxRetries ?? 3,
        retryDelayMs: dto.retryDelayMs ?? 5000,
        customConfig: dto.customConfig ?? {},
      },
      new Types.ObjectId(userId),
    );

    return this.toResponseDto(reg);
  }

  async listProviders(query: ProviderQueryDto): Promise<PaginatedProviderResponseDto> {
    const result = await this.repository.findAll(query);
    return {
      data: result.data.map((r) => this.toResponseDto(r)),
      meta: result.meta,
    };
  }

  async getProvider(key: string): Promise<ProviderRegistrationResponseDto> {
    const reg = await this.repository.findByKey(key);
    if (!reg) throw new NotFoundException(`Provider "${key}" not found`);
    return this.toResponseDto(reg);
  }

  async updateProvider(key: string, dto: UpdateProviderRegistrationDto, userId: string): Promise<ProviderRegistrationResponseDto> {
    const existing = await this.repository.findByKey(key);
    if (!existing) throw new NotFoundException(`Provider "${key}" not found`);

    const updated = await this.repository.update(key, dto, new Types.ObjectId(userId));
    if (!updated) throw new NotFoundException(`Provider "${key}" not found`);
    return this.toResponseDto(updated);
  }

  async enableProvider(key: string, userId: string): Promise<ProviderRegistrationResponseDto> {
    const existing = await this.repository.findByKey(key);
    if (!existing) throw new NotFoundException(`Provider "${key}" not found`);

    const updated = await this.repository.setEnabled(key, true, new Types.ObjectId(userId));
    return this.toResponseDto(updated!);
  }

  async disableProvider(key: string, userId: string): Promise<ProviderRegistrationResponseDto> {
    const existing = await this.repository.findByKey(key);
    if (!existing) throw new NotFoundException(`Provider "${key}" not found`);

    const updated = await this.repository.setEnabled(key, false, new Types.ObjectId(userId));
    return this.toResponseDto(updated!);
  }

  async deleteProvider(key: string, userId: string): Promise<void> {
    const existing = await this.repository.findByKey(key);
    if (!existing) throw new NotFoundException(`Provider "${key}" not found`);

    const deleted = await this.repository.softDelete(key, new Types.ObjectId(userId));
    if (!deleted) throw new BadRequestException(`Failed to delete provider "${key}"`);
  }

  async runHealthCheck(key: string): Promise<ProviderHealthResult> {
    const result = await this.healthService.checkProvider(key);

    await this.repository.updateHealthResult(key, {
      isAvailable: result.isAvailable,
      latencyMs: result.latencyMs,
      error: result.error,
    });

    return result;
  }

  async runAllHealthChecks(): Promise<ProviderHealthSummaryResponseDto> {
    const summary = await this.healthService.checkAll();

    await Promise.allSettled(
      summary.providers.map((r) =>
        this.repository.updateHealthResult(r.key, {
          isAvailable: r.isAvailable,
          latencyMs: r.latencyMs,
          error: r.error,
        }),
      ),
    );

    return summary;
  }

  async validateParams(key: string, params: DataSourceParams): Promise<ProviderValidationResponseDto> {
    const provider = this.registry.resolve(key);
    if (!provider) {
      return { key, valid: false, errors: [`Provider "${key}" is not registered in the runtime registry`] };
    }

    const result = await provider.validate(params);
    return { key, valid: result.valid, errors: result.errors };
  }

  getRegisteredKeys(): string[] {
    return this.registry.getRegisteredKeys();
  }
}
