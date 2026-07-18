import { Inject, Injectable, Optional } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../infrastructure/cache/cache.module';

@Injectable()
export class SettingCache {
  private readonly memory = new Map<string, { expiresAt: number; value: unknown }>();

  constructor(@Optional() @Inject(REDIS_CLIENT) private readonly redis?: Redis) {}

  async get<TValue>(key: string): Promise<TValue | null> {
    const local = this.memory.get(key);
    if (local && local.expiresAt > Date.now()) return local.value as TValue;
    if (!this.redis) return null;
    try {
      const value = await this.redis.get(key);
      return value ? (JSON.parse(value) as TValue) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300) {
    this.memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    if (!this.redis) return;
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      return;
    }
  }

  async invalidate(prefix = 'settings:') {
    for (const key of this.memory.keys()) if (key.startsWith(prefix)) this.memory.delete(key);
    if (!this.redis) return;
    try {
      const keys = await this.redis.keys(`${prefix}*`);
      if (keys.length) await this.redis.del(...keys);
    } catch {
      return;
    }
  }
}
