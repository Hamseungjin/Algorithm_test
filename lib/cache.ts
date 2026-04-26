import { CACHE_TTL_MS } from "./constants";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const stores = new Map<string, Map<string, CacheEntry<unknown>>>();

function getStore(namespace: string): Map<string, CacheEntry<unknown>> {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  return store;
}

export function getCached<T>(namespace: string, key: string): T | null {
  const store = getStore(namespace);
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCached<T>(namespace: string, key: string, data: T): void {
  const store = getStore(namespace);
  store.set(key, { data, timestamp: Date.now() });
}

export function clearCache(namespace?: string): void {
  if (namespace) {
    stores.delete(namespace);
  } else {
    stores.clear();
  }
}
