import { useState } from 'react';
import { BujoItem } from '../types';

export function useBujoItems() {
  const [items, setItems] = useState<BujoItem[]>([]);
  return [items, setItems] as const;
}
