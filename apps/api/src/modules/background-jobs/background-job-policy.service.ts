import { BadRequestException, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { JobIdempotencyScope, JobPayload } from './entities/background-job.entity';
import type { JobDefinition } from './interfaces/background-job.interface';

@Injectable()
export class JobPolicyService {
  validatePayload(definition: JobDefinition, payload: JobPayload) {
    for (const [key, type] of Object.entries(definition.payloadSchema)) {
      const value = payload[key];
      if (value === undefined || value === null) throw new BadRequestException(`${key} is required`);
      if (type === 'array' && !Array.isArray(value)) throw new BadRequestException(`${key} must be an array`);
      if (type !== 'array' && type !== 'object' && typeof value !== type) throw new BadRequestException(`${key} must be ${type}`);
      if (type === 'object' && (typeof value !== 'object' || Array.isArray(value))) throw new BadRequestException(`${key} must be an object`);
    }
  }

  idempotencyKey(definition: JobDefinition, input: { explicit?: string; tenantId?: string; workspaceId?: string; providerKey?: string; marketplaceKey?: string; entityType?: string; entityId?: string; scheduleId?: string; occurrence?: string; payload: JobPayload }) {
    if (!definition.idempotency.enabled) return null;
    const parts = [definition.key];
    for (const scope of definition.idempotency.scopes) {
      if (scope === JobIdempotencyScope.EXPLICIT_REQUEST_KEY && input.explicit) parts.push(`request:${input.explicit}`);
      if (scope === JobIdempotencyScope.TENANT && input.tenantId) parts.push(`tenant:${input.tenantId}`);
      if (scope === JobIdempotencyScope.WORKSPACE && input.workspaceId) parts.push(`workspace:${input.workspaceId}`);
      if (scope === JobIdempotencyScope.PROVIDER && input.providerKey) parts.push(`provider:${input.providerKey}`);
      if (scope === JobIdempotencyScope.MARKETPLACE && input.marketplaceKey) parts.push(`marketplace:${input.marketplaceKey}`);
      if (scope === JobIdempotencyScope.ENTITY && input.entityId) parts.push(`entity:${input.entityType ?? 'entity'}:${input.entityId}`);
      if (scope === JobIdempotencyScope.SCHEDULE_OCCURRENCE && input.scheduleId) parts.push(`schedule:${input.scheduleId}:${input.occurrence ?? ''}`);
      if (scope === JobIdempotencyScope.GLOBAL) parts.push('global');
    }
    if (parts.length === 1) parts.push(JSON.stringify(input.payload));
    return createHash('sha256').update(parts.join('|')).digest('hex');
  }
}
