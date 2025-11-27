// src/lib/serverCache.ts
type CacheEntry = { value: any; expiresAt: number };
const cache: Record<string, CacheEntry> = {};

export function setCache(key: string, value: any, ttl: number) {
  cache[key] = { value, expiresAt: Date.now() + ttl };
}

export function getCache(key: string) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    delete cache[key];
    return null;
  }
  return entry.value;
}
