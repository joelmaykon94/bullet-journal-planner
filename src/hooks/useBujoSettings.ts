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
      // Migrate old defaults to Demon Slayer/Hashira theme colors
      if (parsed.highlightColor === '#E08E45') {
        parsed.highlightColor = '#EF4444'; // Flame Red
      }
      if (parsed.accentColor === '#4A7C6C') {
        parsed.accentColor = '#3B82F6'; // Water Blue
      }
      
      // Initialize default rhythm settings if they don't exist
      if (!parsed.dayStart) parsed.dayStart = '06:00';
      if (!parsed.energyPeakStart) parsed.energyPeakStart = '09:30';
      if (!parsed.energyPeakEnd) parsed.energyPeakEnd = '12:30';
      if (!parsed.restStart) parsed.restStart = '13:30';
      if (!parsed.restEnd) parsed.restEnd = '16:00';
      if (!parsed.secondWindStart) parsed.secondWindStart = '16:30';
      if (!parsed.secondWindEnd) parsed.secondWindEnd = '20:00';
      if (!parsed.dayEnd) parsed.dayEnd = '23:00';

      return parsed;
    }
    return {
      theme: 'dark', // Default to dark mode
      font: 'mono',
      highlightColor: '#EF4444', // Flame Red (Rengoku)
      accentColor: '#3B82F6', // Water Blue (Giyu)
      firstTime: true,
      dayStart: '06:00',
      energyPeakStart: '09:30',
      energyPeakEnd: '12:30',
      restStart: '13:30',
      restEnd: '16:00',
      secondWindStart: '16:30',
      secondWindEnd: '20:00',
      dayEnd: '23:00'
    };
  });

  useEffect(() => {
    const root = document.documentElement;
    document.body.classList.add('dark-theme');
    root.classList.add('dark');
    root.style.setProperty('--bujo-bg', '#080410'); // Deep obsidian night violet (Hashira battlefield)
    root.style.setProperty('--bujo-text', '#e2e8f0');
    
    const highlight = settings.highlightColor === '#E08E45' ? '#EF4444' : settings.highlightColor;
    const accent = settings.accentColor === '#4A7C6C' ? '#3B82F6' : settings.accentColor;
    
    root.style.setProperty('--bujo-highlight', highlight);
    root.style.setProperty('--bujo-accent', accent);
    localStorage.setItem('bujo_focus_settings', JSON.stringify({ ...settings, theme: 'dark', highlightColor: highlight, accentColor: accent }));
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
