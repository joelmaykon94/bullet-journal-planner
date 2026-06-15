import { useState } from 'react';
import { BujoSettings } from '../types';

export function useBujoSettings() {
  const [settings, setSettings] = useState<BujoSettings>({
    theme: 'dark',
    font: 'mono',
    highlightColor: '#E08E45',
    accentColor: '#4A7C6C',
    firstTime: true
  });
  return [settings, setSettings] as const;
}
