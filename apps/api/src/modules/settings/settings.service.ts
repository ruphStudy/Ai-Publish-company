import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction } from '../audit/entities/audit-log.entity';
import { SettingScope, SettingValueStatus } from './entities/setting.entity';
import type { SettingValuePayload } from './entities/setting.entity';
import type { ExportSettingsDto, ImportSettingsDto, ResetSettingDto, SettingsQueryDto, UpdateSettingDto } from './dto/settings.dto';
import type { SettingResolutionContext } from './interfaces/settings.interface';
import { SettingAudit } from './settings-audit.service';
import { SettingCache } from './settings-cache.service';
import { SettingEncryptionService } from './settings-encryption.service';
import { SettingMapper } from './settings.mapper';
import { SettingRegistry } from './settings.registry';
import { SettingRepository } from './settings.repository';
import { SettingResolver } from './settings.resolver';
import { SettingValidator } from './settings.validator';

@Injectable()
export class SettingsService {
  constructor(
    private readonly registry: SettingRegistry,
    private readonly repository: SettingRepository,
    private readonly resolver: SettingResolver,
    private readonly validator: SettingValidator,
    private readonly encryption: SettingEncryptionService,
    private readonly cache: SettingCache,
    private readonly mapper: SettingMapper,
    private readonly audit: SettingAudit,
  ) {}

  categories() {
    return this.registry.categories().map((category) => ({ key: category, label: category.replace(/_/g, ' ').toLowerCase() }));
  }

  registryMetadata(query: SettingsQueryDto = {}) {
    const search = query.search?.toLowerCase();
    return this.registry.byCategory(query.category).filter((definition) => !search || definition.key.toLowerCase().includes(search) || definition.displayName.toLowerCase().includes(search));
  }

  async list(query: SettingsQueryDto) {
    const definitions = this.registryMetadata(query);
    const items = await Promise.all(definitions.map((definition) => this.resolver.resolve(definition, query)));
    return { items, total: items.length };
  }

  async effectiveValue(key: string, context: SettingResolutionContext) {
    const definition = this.requiredDefinition(key);
    return this.resolver.resolve(definition, context);
  }

  async inheritedValues(key: string, context: SettingResolutionContext) {
    const definition = this.requiredDefinition(key);
    const hierarchy = this.resolver.hierarchy(context).filter(({ scope }) => definition.scopes.includes(scope));
    const records = await this.repository.findInherited(key, hierarchy);
    return hierarchy.map((source) => {
      const record = records.find((item) => item.scope === source.scope && (item.scopeId ?? null) === (source.scopeId ?? null));
      return { scope: source.scope, scopeId: source.scopeId, configured: Boolean(record), value: record ? this.mapper.value(record).value : null };
    });
  }

  async update(key: string, dto: UpdateSettingDto, userId?: string) {
    const definition = this.requiredDefinition(key);
    if (!definition.scopes.includes(dto.scope)) throw new BadRequestException(`${key} does not support ${dto.scope} scope`);
    this.validator.validate(definition, dto.value);
    const scopeId = this.scopeId(dto.scope, dto);
    const encrypted = Boolean(definition.encrypted);
    const encryptedValue = encrypted ? this.encryption.encrypt(dto.value) : null;
    const value = encryptedValue?.value ?? dto.value;
    const saved = await this.repository.upsert({ key, scope: dto.scope, scopeId }, {
      key,
      category: definition.category,
      scope: dto.scope,
      scopeId,
      value: value as SettingValuePayload,
      encrypted,
      encryptionKeyVersion: encryptedValue?.keyVersion ?? null,
      status: SettingValueStatus.ACTIVE,
      environment: dto.environment ?? null,
      workspaceId: dto.workspaceId ?? null,
      projectId: dto.projectId ?? null,
      userId: dto.userId ?? null,
      providerKey: dto.providerKey ?? null,
      marketplaceKey: dto.marketplaceKey ?? null,
      featureKey: dto.featureKey ?? null,
      moduleKey: dto.moduleKey ?? null,
      metadata: { restartRequired: definition.restartRequired ?? false },
      updatedBy: userId ?? null,
      createdBy: userId ?? null,
      isDeleted: false,
    });
    await this.cache.invalidate();
    await this.audit.record(AuditAction.UPDATE, userId, saved.settingValueId, { key, scope: dto.scope, scopeId, encrypted });
    return this.mapper.value(saved);
  }

  async resetToInherited(key: string, dto: ResetSettingDto, userId?: string) {
    const definition = this.requiredDefinition(key);
    if (!definition.scopes.includes(dto.scope)) throw new BadRequestException(`${key} does not support ${dto.scope} scope`);
    const scopeId = this.scopeId(dto.scope, dto);
    const deleted = await this.repository.softDelete(key, dto.scope, scopeId, userId);
    await this.cache.invalidate();
    await this.audit.record(AuditAction.DELETE, userId, deleted?.settingValueId ?? key, { key, scope: dto.scope, scopeId, reset: 'INHERITED' });
    return this.effectiveValue(key, dto);
  }

  async resetToDefault(key: string, userId?: string) {
    const definition = this.requiredDefinition(key);
    await this.repository.softDelete(key, SettingScope.SYSTEM, null, userId);
    await this.cache.invalidate();
    await this.audit.record(AuditAction.DELETE, userId, key, { key, reset: 'DEFAULT' });
    return { key, value: definition.encrypted ? this.encryption.mask(definition.defaultValue) : definition.defaultValue, sourceScope: SettingScope.DEFAULT };
  }

  async import(dto: ImportSettingsDto, userId?: string) {
    const items = [];
    for (const item of dto.items) items.push(await this.update(item.key, { scope: item.scope, scopeId: item.scopeId, value: item.value }, userId));
    return { items, total: items.length };
  }

  async export(query: ExportSettingsDto) {
    const values = await this.list(query);
    return { exportedAt: new Date().toISOString(), includeDefaults: query.includeDefaults ?? true, items: values.items };
  }

  async featureFlag(key: string, context: SettingResolutionContext) {
    const settingKey = key.startsWith('feature_flags.') ? key : `feature_flags.${key}`;
    const resolved = await this.effectiveValue(settingKey, context);
    return { key: settingKey, enabled: resolved.value === true, sourceScope: resolved.sourceScope, sourceScopeId: resolved.sourceScopeId };
  }

  private requiredDefinition(key: string) {
    const definition = this.registry.find(key);
    if (!definition) throw new NotFoundException('Setting definition not found');
    return definition;
  }

  private scopeId(scope: SettingScope, context: SettingResolutionContext & { scopeId?: string | null }) {
    if (scope === SettingScope.SYSTEM) return null;
    const id = context.scopeId ?? context.userId ?? context.projectId ?? context.workspaceId ?? context.marketplaceKey ?? context.providerKey ?? context.environment ?? context.featureKey ?? context.moduleKey ?? null;
    if (!id) throw new BadRequestException(`${scope} scope requires a scope identifier`);
    return id;
  }
}
