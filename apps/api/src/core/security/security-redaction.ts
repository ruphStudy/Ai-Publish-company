const sensitiveKeyPattern = /(authorization|cookie|password|passwd|secret|token|refreshToken|accessToken|apiKey|api_key|clientSecret|credential|signedUrl|signature|privateKey)/i;

export function redactSensitive<TValue>(value: TValue, depth = 0): TValue {
  if (depth > 8) return '[MaxDepth]' as TValue;
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map((item) => redactSensitive(item, depth + 1)) as TValue;
  const output: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    output[key] = sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactSensitive(item, depth + 1);
  }
  return output as TValue;
}

export function safeErrorStack(error: unknown) {
  if (process.env.NODE_ENV === 'production') return undefined;
  return error instanceof Error ? error.stack : undefined;
}
