import { Injectable } from '@nestjs/common';
import { SettingScope } from './entities/setting.entity';
import type { SettingDefinition, SettingResolutionContext, SettingValuePayload } from './interfaces/settings.interface';
import { SettingCache } from './settings-cache.service';
import { SettingEncryptionService } from './settings-encryption.service';
import { SettingRepository } from './settings.repository';

@Injectable()
export class SettingResolver {
  constructor(
    private readonly repository: SettingRepository,
    private readonly cache: SettingCache,
    private readonly encryption: SettingEncryptionService,
  ) {}

  async resolve(definition: SettingDefinition, context: SettingResolutionContext, includeSecrets = false) {
    const cacheKey = `settings:effective:${definition.key}:${JSON.stringify(context)}:${includeSecrets ? 'secret' : 'masked'}`;
    if (!definition.encrypted) {
      const cached = await this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const hierarchy = this.hierarchy(context).filter(({ scope }) => definition.scopes.includes(scope));
    const values = await this.repository.findInherited(definition.key, hierarchy);
    const byScope = new Map(values.map((value) => [`${value.scope}:${value.scopeId ?? ''}`, value]));
    for (const item of hierarchy) {
      const record = byScope.get(`${item.scope}:${item.scopeId ?? ''}`);
      if (!record) continue;
      const raw = record.encrypted && typeof record.value === 'string' ? this.encryption.decrypt<SettingValuePayload>(record.value) : record.value;
      const resolved = { key: definition.key, value: record.encrypted && !includeSecrets ? this.encryption.mask(raw) : raw, sourceScope: record.scope, sourceScopeId: record.scopeId, inherited: item.scope !== hierarchy[0]?.scope || item.scopeId !== hierarchy[0]?.scopeId, encrypted: record.encrypted, restartRequired: definition.restartRequired ?? false, definition };
      if (!record.encrypted) await this.cache.set(cacheKey, resolved);
      return resolved;
    }

    const resolved = { key: definition.key, value: definition.encrypted && !includeSecrets ? this.encryption.mask(definition.defaultValue) : definition.defaultValue, sourceScope: SettingScope.DEFAULT, sourceScopeId: null, inherited: true, encrypted: Boolean(definition.encrypted), restartRequired: definition.restartRequired ?? false, definition };
    if (!definition.encrypted) await this.cache.set(cacheKey, resolved);
    return resolved;
  }

  hierarchy(context: SettingResolutionContext) {
    return [
      { scope: SettingScope.USER, scopeId: context.userId ?? null },
      { scope: SettingScope.PROJECT, scopeId: context.projectId ?? null },
      { scope: SettingScope.WORKSPACE, scopeId: context.workspaceId ?? null },
      { scope: SettingScope.MARKETPLACE, scopeId: context.marketplaceKey ?? null },
      { scope: SettingScope.PROVIDER, scopeId: context.providerKey ?? null },
      { scope: SettingScope.ENVIRONMENT, scopeId: context.environment ?? process.env.NODE_ENV ?? null },
      { scope: SettingScope.SYSTEM, scopeId: null },
    ].filter((item) => item.scope === SettingScope.SYSTEM || Boolean(item.scopeId));
  }
}
