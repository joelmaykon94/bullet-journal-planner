import { useState, useEffect } from 'react';
import { BujoSettings } from '../types';

export function useBujoSettings() {
  const [settings, setSettings] = useState<BujoSettings>(() => {
    const saved = localStorage.getItem('bujo_focus_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.theme = 'dark'; // Force dark mode
      if (parsed.font === 'sans' || !parsed.font) {
        parsed.font = 'mono';
      }
      return parsed;
    }
    return {
      theme: 'dark', // Default to dark mode
      font: 'mono',
      highlightColor: '#E08E45',
      accentColor: '#4A7C6C',
      firstTime: true
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.add('dark-theme');
    root.classList.add('dark');
    root.style.setProperty('--bujo-bg', '#040707'); // Deep cozy forest night obsidian green-black
    root.style.setProperty('--bujo-text', '#e2e8f0');
    root.style.setProperty('--bujo-highlight', settings.highlightColor);
    root.style.setProperty('--bujo-accent', settings.accentColor);
    localStorage.setItem('bujo_focus_settings', JSON.stringify({ ...settings, theme: 'dark' }));
  }, [settings]);

  const currentFontClass = () => {
    if (settings.font === 'dyslexic') return 'font-dyslexic';
    if (settings.font === 'mono') return 'font-mono';
    return 'font-sans';
  };

  return {
    settings,
    setSettings,
    currentFontClass
  };
}
