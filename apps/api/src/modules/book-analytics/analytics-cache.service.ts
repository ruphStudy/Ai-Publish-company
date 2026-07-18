import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsCacheService {
  private readonly cache = new Map<string, { expiresAt: number; value: unknown }>();
  get<T>(key: string): T | null { const hit = this.cache.get(key); if (!hit || hit.expiresAt < Date.now()) return null; return hit.value as T; }
  set(key: string, value: unknown, ttlSeconds: number): void { this.cache.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 }); }
  delete(key: string): void { this.cache.delete(key); }
}
