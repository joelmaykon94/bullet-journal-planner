/**
 * Utility functions for timestamps and timestamp-based conflict resolution during sync.
 */

export function getIsoTimestamp(): string {
  return new Date().toISOString();
}

export function ensureTimestamps<T extends { createdAt?: string; updatedAt?: string }>(
  item: T,
  fallbackTime?: string
): T {
  const now = fallbackTime || getIsoTimestamp();
  return {
    ...item,
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || item.createdAt || now
  };
}

/**
 * Returns true if record A is strictly newer than record B based on updatedAt.
 */
export function isNewer(a: { updatedAt?: string }, b: { updatedAt?: string }): boolean {
  if (!a.updatedAt) return false;
  if (!b.updatedAt) return true;
  return new Date(a.updatedAt).getTime() > new Date(b.updatedAt).getTime();
}

/**
 * Merges two arrays of items by `id` using `updatedAt` timestamp comparison.
 * The item with the latest `updatedAt` wins.
 * If an item exists in one array only, it is included.
 */
export function mergeArraysByTimestamp<T extends { id: string; updatedAt?: string; createdAt?: string; deletedAt?: string }>(
  localList: T[],
  cloudList: T[]
): T[] {
  const map = new Map<string, T>();

  const processItem = (item: T) => {
    if (!item || !item.id) return;
    const sanitized = ensureTimestamps(item);
    const existing = map.get(sanitized.id);

    if (!existing) {
      map.set(sanitized.id, sanitized);
    } else {
      if (isNewer(sanitized, existing)) {
        map.set(sanitized.id, sanitized);
      }
    }
  };

  (cloudList || []).forEach(processItem);
  (localList || []).forEach(processItem);

  return Array.from(map.values());
}
