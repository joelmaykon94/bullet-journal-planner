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
 * Respects `deletedAt` timestamps and trashMap to prevent deleted items from reappearing during sync.
 */
export function mergeArraysByTimestamp<T extends { id: string; updatedAt?: string; createdAt?: string; deletedAt?: string }>(
  localList: T[],
  cloudList: T[],
  trashMap?: Map<string, any>,
  allowDeleted = false
): T[] {
  const map = new Map<string, T>();

  const processItem = (item: T) => {
    if (!item || !item.id) return;
    const sanitized = ensureTimestamps(item);

    // Skip item if it is explicitly marked as deleted (unless merging trash list itself)
    if (sanitized.deletedAt && !allowDeleted) {
      return;
    }

    // Check if the item is present in the trash map
    if (trashMap && trashMap.has(sanitized.id)) {
      const trashItem = trashMap.get(sanitized.id);
      const trashTime = new Date(trashItem.deletedAt || trashItem.updatedAt || 0).getTime();
      const itemTime = new Date(sanitized.updatedAt || sanitized.createdAt || 0).getTime();

      // If trash timestamp is newer than or equal to active item timestamp, keep item deleted
      if (trashTime >= itemTime) {
        return;
      }
    }

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

