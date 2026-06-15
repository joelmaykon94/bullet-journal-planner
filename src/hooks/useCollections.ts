import { useState } from 'react';

export function useCollections() {
  const [collections, setCollections] = useState<any[]>([]);
  return [collections, setCollections] as const;
}
