export const performanceGuardrails = {
  pagination: { defaultLimit: 25, maxLimit: 100 },
  batch: { defaultSize: 250, maxSize: 5000 },
  export: { syncRowLimit: 10000 },
  query: { slowMs: 250, timeoutMs: 15000 },
  request: { slowMs: 1000, timeoutMs: 30000 },
  cache: { registryTtlSeconds: 3600, effectiveSettingsTtlSeconds: 300, analyticsTtlSeconds: 120 },
  dashboard: { staleMs: 300000, pollingMs: 30000 },
  jobs: { progressWriteMinIntervalMs: 1000, workerConcurrency: 10 },
} as const;

export function boundedLimit(value: unknown, fallback = performanceGuardrails.pagination.defaultLimit, max = performanceGuardrails.pagination.maxLimit) {
  const parsed = Number(value ?? fallback);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.trunc(parsed), 1), max);
}

export function boundedPage(value: unknown) {
  const parsed = Number(value ?? 1);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(Math.trunc(parsed), 1);
}

export function stableCacheKey(prefix: string, parts: Record<string, unknown>) {
  const normalized = Object.keys(parts).sort().map((key) => `${key}:${JSON.stringify(parts[key] ?? null)}`).join('|');
  return `${prefix}:${normalized}`;
}
